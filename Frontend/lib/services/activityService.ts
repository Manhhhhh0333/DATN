import apiClient from '../api';

export interface CompleteActivityRequest {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
  activityId: string;
  score?: number;
}

export interface CheckVocabularyRequest {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
}

export interface ActivityProgressResponse {
  activityId: string;
  isCompleted: boolean;
  score?: number;
  completedAt?: string;
}

export interface CanAccessPartResponse {
  canAccess: boolean;
  reason: string;
  previousPart?: number;
  completedActivities?: number;
  totalActivities?: number;
}

/**
 * Đánh dấu một activity đã hoàn thành
 */
export const completeActivity = async (request: CompleteActivityRequest): Promise<any> => {
  const response = await apiClient.post(
    `/activities/complete`,
    request
  );
  return response.data;
};

/**
 * Kiểm tra xem activity đã hoàn thành chưa
 */
export const checkActivityCompleted = async (
  activityId: string,
  hskLevel?: number,
  partNumber?: number,
  topicId?: number
): Promise<{ activityId: string; isCompleted: boolean }> => {
  const params = new URLSearchParams();
  params.append('activityId', activityId);
  if (hskLevel) params.append('hskLevel', hskLevel.toString());
  if (partNumber) params.append('partNumber', partNumber.toString());
  if (topicId) params.append('topicId', topicId.toString());

  const response = await apiClient.get<{ activityId: string; isCompleted: boolean }>(
    `/activities/check-completed?${params.toString()}`
  );
  return response.data;
};

/**
 * Lấy danh sách activities đã hoàn thành
 */
export const getCompletedActivities = async (
  hskLevel?: number,
  partNumber?: number,
  topicId?: number
): Promise<ActivityProgressResponse[]> => {
  const params = new URLSearchParams();
  if (hskLevel) params.append('hskLevel', hskLevel.toString());
  if (partNumber) params.append('partNumber', partNumber.toString());
  if (topicId) params.append('topicId', topicId.toString());

  const response = await apiClient.get<ActivityProgressResponse[]>(
    `/activities/completed-list?${params.toString()}`
  );
  return response.data;
};

/**
 * Kiểm tra và tự động đánh dấu activity "vocabulary" nếu tất cả từ đã học
 * Frontend gọi API này sau khi user đánh dấu từ cuối cùng là "đã học"
 */
export const checkAndMarkVocabulary = async (
  request: CheckVocabularyRequest
): Promise<{ marked: boolean; message: string }> => {
  // Sử dụng apiClient để đảm bảo baseURL và auth headers đúng
  const response = await apiClient.post<{ marked: boolean; message: string }>(
    `/activities/check-and-mark-vocabulary`,
    request
  );
  return response.data;
};

/**
 * Kiểm tra xem user có thể truy cập part này không (prerequisite check)
 * Part N unlock khi part N-1 đã hoàn thành 100% activities
 */
export const canAccessPart = async (
  hskLevel: number,
  partNumber: number
): Promise<CanAccessPartResponse> => {
  const response = await apiClient.get<CanAccessPartResponse>(
    `/activities/can-access-part?hskLevel=${hskLevel}&partNumber=${partNumber}`
  );
  return response.data;
};


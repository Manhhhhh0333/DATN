import json
import os

topics_keywords = {
    1: ["你", "好", "谢谢", "再见", "请", "不客气", "对不起", "没关系", "是", "不是", "对", "不对", "可以", "不可以", "喂", "怎么样", "怎么", "呢", "吗", "这", "那", "哪", "哪儿"],
    2: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "今天", "明天", "昨天", "现在", "小时", "分钟", "年", "月", "日", "星期", "点", "号", "时候", "上午", "下午", "中午"],
    3: ["人", "爸爸", "妈妈", "孩子", "家", "朋友", "老师", "学生", "医生", "先生", "小姐", "男", "女", "儿子", "女儿", "同学", "名字"],
    4: ["是", "有", "来", "去", "看", "听", "说", "做", "吃", "喝", "睡", "工作", "学习", "买", "卖", "开", "关", "走", "跑", "坐", "读", "写", "认识", "会", "能", "想", "叫", "回", "看见", "睡觉", "打电话"],
    5: ["大", "小", "好", "新", "老", "多", "少", "高", "低", "长", "短", "热", "冷", "快", "慢", "坏", "对", "错", "很", "太", "漂亮"],
    6: ["上", "下", "里", "外", "前", "后", "左", "右", "学校", "家", "医院", "商店", "饭店", "北京", "中国", "前面", "后面", "哪儿", "哪", "在"],
    7: ["水", "茶", "饭", "菜", "水果", "肉", "鱼", "米", "面", "鸡蛋", "牛奶", "咖啡", "酒", "米饭", "苹果", "杯子"],
    8: ["红", "白", "黑", "绿", "蓝", "黄", "书", "笔", "纸", "桌子", "椅子", "门", "窗", "车", "电脑", "手机", "电视", "电影", "东西", "本", "块", "个", "些", "字", "衣服", "出租车", "飞机", "电脑", "电视", "电影"],
    9: ["天", "地", "山", "水", "雨", "雪", "风", "太阳", "月亮", "树", "花", "草", "鸟", "狗", "猫", "天气", "下雨", "冷", "热"],
    10: ["手", "头", "眼", "身体", "脚", "口", "耳", "心", "病", "医院", "医生", "药"],
    11: ["吃", "喝", "睡", "工作", "学习", "玩", "看", "听", "说", "写", "读", "买", "卖", "洗", "穿", "睡觉", "学习", "工作", "打电话"],
    12: []
}

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, "..", "data")
json_file = os.path.join(data_dir, "seed-data-hsk1.json")

with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

classified_count = {i: 0 for i in range(1, 13)}

for word in data["words"]:
    character = word["character"]
    topic_id = None
    
    for topic_id_check, keywords in topics_keywords.items():
        if character in keywords:
            topic_id = topic_id_check
            classified_count[topic_id] += 1
            break
    
    if topic_id is None:
        topic_id = 12
        classified_count[12] += 1
    
    word["topicId"] = topic_id

with open(json_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Phan loai hoan thanh!")
print("\nThong ke:")
for topic_id in range(1, 13):
    count = classified_count[topic_id]
    topic_name = {
        1: "Chao hoi & Giao tiep co ban",
        2: "So dem & Thoi gian",
        3: "Nguoi & Gia dinh",
        4: "Dong tu co ban",
        5: "Tinh tu & Mo ta",
        6: "Dia diem & Phuong huong",
        7: "Thuc an & Do uong",
        8: "Mau sac & Do vat",
        9: "Thoi tiet & Thien nhien",
        10: "Co the & Suc khoe",
        11: "Hoat dong hang ngay",
        12: "Tong hop & On tap"
    }[topic_id]
    print(f"  Topic {topic_id} ({topic_name}): {count} tu")


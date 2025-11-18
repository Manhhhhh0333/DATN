USE [HIHSK];

-- Cap nhat TopicId cho tu vung HSK1 tu file JSON
-- Script nay se cap nhat TopicId cho cac tu vung da co trong database

-- Topic 1: Chao hoi & Giao tiep co ban
UPDATE Words SET TopicId = 1 WHERE HSKLevel = 1 AND Character IN (
    N'你', N'好', N'谢谢', N'再见', N'请', N'不客气', N'对不起', N'没关系', 
    N'是', N'不是', N'对', N'不对', N'可以', N'不可以', N'喂', N'怎么样', 
    N'怎么', N'呢', N'吗', N'这', N'那', N'哪', N'哪儿'
);

-- Topic 2: So dem & Thoi gian
UPDATE Words SET TopicId = 2 WHERE HSKLevel = 1 AND Character IN (
    N'一', N'二', N'三', N'四', N'五', N'六', N'七', N'八', N'九', N'十', 
    N'今天', N'明天', N'昨天', N'现在', N'小时', N'分钟', N'年', N'月', 
    N'日', N'星期', N'点', N'号', N'时候', N'上午', N'下午', N'中午'
);

-- Topic 3: Nguoi & Gia dinh
UPDATE Words SET TopicId = 3 WHERE HSKLevel = 1 AND Character IN (
    N'人', N'爸爸', N'妈妈', N'孩子', N'家', N'朋友', N'老师', N'学生', 
    N'医生', N'先生', N'小姐', N'男', N'女', N'儿子', N'女儿', N'同学', N'名字'
);

-- Topic 4: Dong tu co ban
UPDATE Words SET TopicId = 4 WHERE HSKLevel = 1 AND Character IN (
    N'是', N'有', N'来', N'去', N'看', N'听', N'说', N'做', N'吃', N'喝', 
    N'睡', N'工作', N'学习', N'买', N'卖', N'开', N'关', N'走', N'跑', 
    N'坐', N'读', N'写', N'认识', N'会', N'能', N'想', N'叫', N'回', 
    N'看见', N'睡觉', N'打电话'
);

-- Topic 5: Tinh tu & Mo ta
UPDATE Words SET TopicId = 5 WHERE HSKLevel = 1 AND Character IN (
    N'大', N'小', N'好', N'新', N'老', N'多', N'少', N'高', N'低', N'长', 
    N'短', N'热', N'冷', N'快', N'慢', N'坏', N'对', N'错', N'很', N'太', N'漂亮'
);

-- Topic 6: Dia diem & Phuong huong
UPDATE Words SET TopicId = 6 WHERE HSKLevel = 1 AND Character IN (
    N'上', N'下', N'里', N'外', N'前', N'后', N'左', N'右', N'学校', N'家', 
    N'医院', N'商店', N'饭店', N'北京', N'中国', N'前面', N'后面', N'哪儿', N'哪', N'在'
);

-- Topic 7: Thuc an & Do uong
UPDATE Words SET TopicId = 7 WHERE HSKLevel = 1 AND Character IN (
    N'水', N'茶', N'饭', N'菜', N'水果', N'肉', N'鱼', N'米', N'面', 
    N'鸡蛋', N'牛奶', N'咖啡', N'酒', N'米饭', N'苹果', N'杯子'
);

-- Topic 8: Mau sac & Do vat
UPDATE Words SET TopicId = 8 WHERE HSKLevel = 1 AND Character IN (
    N'红', N'白', N'黑', N'绿', N'蓝', N'黄', N'书', N'笔', N'纸', 
    N'桌子', N'椅子', N'门', N'窗', N'车', N'电脑', N'手机', N'电视', 
    N'电影', N'东西', N'本', N'块', N'个', N'些', N'字', N'衣服', 
    N'出租车', N'飞机'
);

-- Topic 9: Thoi tiet & Thien nhien
UPDATE Words SET TopicId = 9 WHERE HSKLevel = 1 AND Character IN (
    N'天', N'地', N'山', N'水', N'雨', N'雪', N'风', N'太阳', N'月亮', 
    N'树', N'花', N'草', N'鸟', N'狗', N'猫', N'天气', N'下雨', N'冷', N'热'
);

-- Topic 10: Co the & Suc khoe
UPDATE Words SET TopicId = 10 WHERE HSKLevel = 1 AND Character IN (
    N'手', N'头', N'眼', N'身体', N'脚', N'口', N'耳', N'心', N'病', 
    N'医院', N'医生', N'药'
);

-- Topic 11: Hoat dong hang ngay
UPDATE Words SET TopicId = 11 WHERE HSKLevel = 1 AND Character IN (
    N'吃', N'喝', N'睡', N'工作', N'学习', N'玩', N'看', N'听', N'说', 
    N'写', N'读', N'买', N'卖', N'洗', N'穿', N'睡觉', N'学习', N'工作', N'打电话'
);

-- Topic 12: Tong hop & On tap (cac tu con lai)
UPDATE Words SET TopicId = 12 WHERE HSKLevel = 1 AND TopicId IS NULL;

-- Kiem tra ket qua
SELECT 
    TopicId,
    COUNT(*) AS SoTu
FROM Words
WHERE HSKLevel = 1
GROUP BY TopicId
ORDER BY TopicId;

SELECT 
    t.Id AS TopicId,
    t.Title AS TenChuDe,
    t.TopicIndex,
    COUNT(w.Id) AS SoTu
FROM LessonTopics t
LEFT JOIN Words w ON w.TopicId = t.Id AND w.HSKLevel = 1
WHERE t.HSKLevel = 1
GROUP BY t.Id, t.Title, t.TopicIndex
ORDER BY t.TopicIndex;


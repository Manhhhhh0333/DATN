USE [HIHSK];

-- Xoa tat ca foreign keys tham chieu den bang Lessons (neu bang ton tai)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons')
BEGIN
    DECLARE @sql NVARCHAR(MAX) = '';

    -- Xoa foreign keys tu cac bang khac tham chieu den Lessons
    SELECT @sql = @sql + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];' + CHAR(13)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('Lessons');

    -- Xoa foreign keys trong bang Lessons (self-referencing)
    SELECT @sql = @sql + 'ALTER TABLE [Lessons] DROP CONSTRAINT [' + name + '];' + CHAR(13)
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('Lessons');

    IF LEN(@sql) > 0
    BEGIN
        EXEC sp_executesql @sql;
    END
END

-- Xoa indexes cua bang Lessons
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Lessons_PrerequisiteLessonId' AND object_id = OBJECT_ID('Lessons'))
    DROP INDEX [IX_Lessons_PrerequisiteLessonId] ON [Lessons];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Lessons_CourseId_LessonIndex' AND object_id = OBJECT_ID('Lessons'))
    DROP INDEX [IX_Lessons_CourseId_LessonIndex] ON [Lessons];

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Lessons_CourseId' AND object_id = OBJECT_ID('Lessons'))
    DROP INDEX [IX_Lessons_CourseId] ON [Lessons];

-- Xoa bang Lessons
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons')
BEGIN
    DROP TABLE [Lessons];
END


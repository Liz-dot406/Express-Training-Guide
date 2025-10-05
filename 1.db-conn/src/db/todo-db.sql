
--users table
CREATE TABLE Users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15)
);

-- Sample data
INSERT INTO Users (first_name, last_name, email, phone_number) VALUES
('Alice', 'Mwangi', 'alice@gmail.com', '0711000001'),
('Brian', 'Kemboi', 'brian@gmail.com', '0711000002'),
('Carol', 'Koech', 'carol@gmail.com', '0711000003'),
('David', 'Mutiso', 'david@gmail.com', '0711000004'),
('Esther', 'Wambui', 'esther@gmail.com', '0711000005');


---todos table
CREATE TABLE Todos (
    todoid INT IDENTITY(1,1) PRIMARY KEY,
    todo_name VARCHAR(100) NOT NULL,
    description VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    due_date DATETIME,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(userid)
);

-- Sample data
INSERT INTO Todos (todo_name, description, created_at, due_date, user_id) VALUES
('Finish Project Plan', 'Prepare project plan for QA.', GETDATE(), '2025-10-09 00:00:00', 1),
('Update Website', 'Add new blog section and images.', GETDATE(), '2025-10-14 00:00:00', 2),
('Team Meeting', 'Weekly catch-up meeting.', GETDATE(), '2025-10-07 00:00:00', 1),
('Database Backup', 'Perform full SQL backup.', GETDATE(), '2025-10-12 00:00:00', 3),
('Create Logo Design', 'Work on new branding logo.', GETDATE(), '2025-10-22 00:00:00', 4),
('QA Testing', 'Run test cases for new feature.', GETDATE(), '2025-10-20 00:00:00', 5),
('Prepare Invoice', 'Generate invoices for clients.', GETDATE(), '2025-10-09 00:00:00', 3),
('Security Audit', 'Review user permissions and access.', GETDATE(), '2025-10-09 00:00:00', 2);


-- comments table
CREATE TABLE Comments (
    commentid INT IDENTITY(1,1) PRIMARY KEY,
    comment_name VARCHAR(MAX) NOT NULL,
    todo_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES Todos(todoid),
    FOREIGN KEY (user_id) REFERENCES Users(userid)
);

-- Sample data

INSERT INTO Comments (comment_name, todo_id, user_id) VALUES
('Great progress so far!', 1, 2),
('Need to adjust the deadline.', 1, 3),
('Website images updated successfully.', 2, 1),
('Backup completed with no errors.', 4, 3),
('Logo draft looks amazing.', 5, 4),
('Please recheck test case #23.', 6, 5),
('Invoices reviewed and approved.', 7, 1),
('Access audit pending final review.', 8, 2),
('Add summary to meeting notes.', 3, 1),
('Team agrees with the new logo concept.', 5, 2);



--Drop table Todo
DROP TABLE Todos;

--Reseed Todos table to start from 1
DBCC CHECKIDENT ('Todos', RESEED, 1);



--Drop table Comments
DROP TABLE Comments;

--Reseed Comments table to start from 1
DBCC CHECKIDENT ('Comments', RESEED, 1);


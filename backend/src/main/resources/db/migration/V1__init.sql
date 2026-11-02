CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE
);

INSERT INTO category (name) VALUES
    ('Hostel'),
    ('Laboratory'),
    ('Classroom'),
    ('Network'),
    ('Other');

CREATE TABLE issue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    reporter_name VARCHAR(80) NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_issue_category FOREIGN KEY (category_id) REFERENCES category (id)
);

CREATE INDEX idx_issue_status_created_at ON issue (status, created_at);

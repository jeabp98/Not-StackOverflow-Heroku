CREATE DATABASE db_stackoverflow;

USE db_stackoverflow;

-- USERS TABLE
CREATE TABLE users(
    id INT(11) NOT NULL,
    username VARCHAR(16) NOT NULL,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL
);

ALTER TABLE users
    ADD PRIMARY KEY (id);

ALTER TABLE users
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT;

DESCRIBE users;

-- POSTS TABLE

CREATE TABLE posts (
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE posts
    ADD PRIMARY KEY (id);

ALTER TABLE posts
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE posts
    MODIFY body TEXT NOT NULL;

DESCRIBE posts;

-- ANSWERS TABLE

CREATE TABLE answers (
    id INT(11) NOT NULL,
    body TEXT NOT NULL,
    post_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_user_answers FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE answers
    ADD PRIMARY KEY (id);

ALTER TABLE answers
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT;



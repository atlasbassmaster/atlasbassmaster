-- init.sql
CREATE TABLE IF NOT EXISTS toise (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                -- 'id' as a primary key with auto-increment
    firstname VARCHAR(255) NOT NULL,       -- 'firstname' as a VARCHAR with a maximum length of 255 characters
    lastname VARCHAR(255) NOT NULL,        -- 'lastname' as a VARCHAR with a maximum length of 255 characters
    phone_number VARCHAR(15),              -- 'phone_number' as a VARCHAR (you can adjust the length as needed)
    toise_id INT,                          -- 'toise_id' as an integer (foreign key reference)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 'created_at' filled automatically on creation
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 'modified_at' filled automatically on creation
    CONSTRAINT fk_toise FOREIGN KEY (toise_id) REFERENCES toise(id) -- Foreign key reference to 'toise' table
);
ALTER TABLE users ADD CONSTRAINT unique_toise UNIQUE (toise_id);

insert into toise values (1, 'atlasbassmatser');
insert into toise values (2, 'atlasbassmatser');

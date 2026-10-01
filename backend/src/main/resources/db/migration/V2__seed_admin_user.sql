-- Default administrator account.
-- Username: admin | Password: Admin@123  (CHANGE THIS after first login)
INSERT INTO annakut.users (username, password_hash, full_name, role, enabled)
VALUES ('admin', '$2b$10$al9o.yqEtIaDW4nD/KETBu1/wtpkvNJ4WInkOEOv/kz.b5pzw4K7W', 'Administrator', 'ADMIN', TRUE);

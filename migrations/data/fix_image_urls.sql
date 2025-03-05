-- Update image URLs to be version-independent
UPDATE api.sponsors
SET image_url = REGEXP_REPLACE(
    image_url,
    '/v\d+/',
    '/v1/',
    'g'
)
WHERE image_url IS NOT NULL; 
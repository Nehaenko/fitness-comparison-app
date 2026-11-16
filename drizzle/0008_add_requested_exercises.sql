INSERT INTO "exercises" ("external_id", "name", "muscle_group", "equipment")
VALUES
    ('forma:running', 'Running', 'cardiovascular system', 'body only'),
    ('forma:step-machine', 'Step Machine', 'cardiovascular system', 'machine'),
    ('forma:rowing-machine', 'Rowing Machine', 'cardiovascular system', 'machine'),
    ('forma:negative-pull-up', 'Negative Pull-Up', 'lats', 'body only'),
    ('forma:hollow-rock', 'Hollow Rock', 'abdominals', 'body only')
ON CONFLICT ("external_id") DO NOTHING;

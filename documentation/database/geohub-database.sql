
CREATE TABLE geohub.dataset
(
  id         character varying        NOT NULL,
  url        character varying        NOT NULL,
  name       character varying        NOT NULL,
  description     character varying       ,
  is_raster  boolean                  NOT NULL,
  license    character varying       ,
  bounds     geometry (Polygon, 4326) NOT NULL,
  createdat  timestamp with time zone NOT NULL,
  created_user character varying(100) NOT NULL,
  updatedat  timestamp with time zone,
  updated_user character varying(100)   ,
  PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.dataset IS 'this table manages metadata of files';

COMMENT ON COLUMN geohub.dataset.id IS 'md5 hash generated from URL';

COMMENT ON COLUMN geohub.dataset.url IS 'stores URL for dataset. e.g., URL for azure blob, URL for mosaicjson';

COMMENT ON COLUMN geohub.dataset.is_raster IS 'raster or vector';

COMMENT ON COLUMN geohub.dataset.license IS 'data license';

COMMENT ON COLUMN geohub.dataset.bounds IS 'bounds of data';

CREATE INDEX IF NOT EXISTS dataset_bounds_geom_idx
    ON geohub.dataset USING gist
    (bounds)

CREATE TABLE geohub.dataset_tag
(
  dataset_id character varying NOT NULL,
  tag_id     serial            NOT NULL,
  CONSTRAINT dataset_tag_pkey PRIMARY KEY (dataset_id, tag_id)
);

COMMENT ON TABLE geohub.dataset_tag IS 'this table connects file_metadata and tag tables';

COMMENT ON COLUMN geohub.dataset_tag.dataset_id IS 'unique ID for dataset';

COMMENT ON COLUMN geohub.dataset_tag.tag_id IS 'unique ID for tag name';

CREATE TABLE geohub.style
(
  id        serial                   NOT NULL,
  name      character varying(100)   NOT NULL,
  style     json                     NOT NULL,
  createdat timestamp with time zone NOT NULL DEFAULT now(),
  updatedat timestamp with time zone NOT NULL DEFAULT now(),
  layers json,
  access_level integer                  NOT NULL DEFAULT 1,
  created_user character varying(100)   ,
  updated_user character varying(100)   ,
  PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.style IS 'this table manages style.json created at geohub';

CREATE TABLE geohub.tag
(
  id    serial            NOT NULL,
  value character varying NOT NULL,
  key   character varying NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.tag IS 'this table manages tags';

COMMENT ON COLUMN geohub.tag.id IS 'unique ID for tag name';

COMMENT ON COLUMN geohub.tag.value IS 'tag value';

COMMENT ON COLUMN geohub.tag.key IS 'tag key';

ALTER TABLE geohub.dataset_tag
  ADD CONSTRAINT FK_tag_TO_dataset_tag
    FOREIGN KEY (tag_id)
    REFERENCES geohub.tag (id);

ALTER TABLE geohub.dataset_tag
  ADD CONSTRAINT FK_dataset_TO_dataset_tag
    FOREIGN KEY (dataset_id)
    REFERENCES geohub.dataset (id);

-- DROP INDEX IF EXISTS geohub.tag_idx_key_value;

CREATE INDEX IF NOT EXISTS tag_idx_key_value
    ON geohub.tag USING btree
    (key COLLATE pg_catalog."default" ASC NULLS LAST, value COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: tag_idx_value

-- DROP INDEX IF EXISTS geohub.tag_idx_value;

CREATE INDEX IF NOT EXISTS tag_idx_value
    ON geohub.tag USING btree
    (value COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE TABLE geohub.dataset_favourite
(
    dataset_id character varying NOT NULL,
    user_email character varying(100) NOT NULL,
    savedat timestamp with time zone NOT NULL,
    CONSTRAINT dataset_favourite_pkey PRIMARY KEY (dataset_id, user_email),
    CONSTRAINT "FK_dataset_TO_dataset_favourite" FOREIGN KEY (dataset_id)
        REFERENCES geohub.dataset (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

COMMENT ON TABLE geohub.dataset_favourite
    IS 'This table manages users to save their favourite datasets';

COMMENT ON COLUMN geohub.dataset_favourite.dataset_id
    IS 'md5 hash generated from URL';

COMMENT ON COLUMN geohub.dataset_favourite.user_email
    IS 'user email address';

COMMENT ON COLUMN geohub.dataset_favourite.savedat
    IS 'timestamp which users saved';

DROP TABLE IF EXISTS geohub.country;

CREATE TABLE IF NOT EXISTS geohub.country
(
    iso_3 character varying  NOT NULL,
    iso_code integer  NOT NULL,
    iso_2 character varying NULL,
    name character varying  NOT NULL,
    region1_code integer NOT NULL,
    region1_name character varying  NOT NULL,
    region2_code integer NOT NULL,
    region2_name character varying  NOT NULL,
    region3_code integer NOT NULL,
    region3_name character varying  NOT NULL,
    CONSTRAINT country_pkey PRIMARY KEY (iso_3)
)

-- superuser table
CREATE TABLE geohub.superuser
(
    user_email character varying(100) NOT NULL,
    createdat timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT superuser_pkey PRIMARY KEY (user_email)
);

ALTER TABLE IF EXISTS geohub.superuser
    OWNER to undpgeohub;

COMMENT ON TABLE geohub.superuser
    IS 'this table manages superusers across geohub app';

-- dataset_permission table
CREATE TABLE geohub.dataset_permission
(
    dataset_id character varying NOT NULL,
    user_email character varying(100) NOT NULL,
    permission smallint NOT NULL DEFAULT 1,
    createdat timestamp with time zone NOT NULL DEFAULT now(),
    updatedat timestamp with time zone,
    CONSTRAINT dataset_permission_pkey PRIMARY KEY (dataset_id, user_email),
    CONSTRAINT "FK_dataset_TO_dataset_permission" FOREIGN KEY (dataset_id)
        REFERENCES geohub.dataset (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS geohub.dataset_permission
    OWNER to undpgeohub;

COMMENT ON TABLE geohub.dataset_permission
    IS 'this table manages users'' permission for operating each dataset';

COMMENT ON COLUMN geohub.dataset_permission.permission
    IS '1: read, 2: read/write, 3: owner';


CREATE TABLE geohub.user_settings
(
    user_email character varying(100) NOT NULL,
    settings json NOT NULL,
    CONSTRAINT user_settings_pkey PRIMARY KEY (user_email)
);

ALTER TABLE IF EXISTS geohub.user_settings
    OWNER to undpgeohub;

COMMENT ON TABLE geohub.user_settings
    IS 'This table stores user settings';

COMMENT ON COLUMN geohub.user_settings.user_email
    IS 'user email address';

COMMENT ON COLUMN geohub.user_settings.settings
    IS 'This column stores user settings in json format';
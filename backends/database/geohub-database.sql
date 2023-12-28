
CREATE TABLE geohub.dataset
(
  id         character varying        NOT NULL,
  url        character varying        NOT NULL,
  name       character varying        NOT NULL,
  description     character varying       ,
  is_raster  boolean                  NOT NULL,
  license    character varying       ,
  bounds     geometry (Polygon, 4326) NOT NULL,
  access_level integer                  NOT NULL DEFAULT 3,
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

COMMENT ON COLUMN geohub.dataset.access_level IS '1: login user, 2: UNDP, 3: public';

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

CREATE TABLE geohub.dataset_defaultstyle
(
  dataset_id   character varying        NOT NULL,
  layer_id     character varying        NOT NULL,
  layer_type   character varying        NOT NULL,
  source       json                     NOT NULL,
  style        json                     NOT NULL,
  colormap_name         character varying       ,
  classification_method character varying       ,
  classification_method_2 character varying     ,
  created_user character varying(100)   NOT NULL,
  createdat    timestamp with time zone NOT NULL DEFAULT now(),
  updatedat    timestamp with time zone,
  updated_user character varying(100)  ,
  CONSTRAINT dataset_defaultstyle_pkey PRIMARY KEY (dataset_id, layer_id, layer_type),
  CONSTRAINT "FK_dataset_TO_dataset_id, layer_type" FOREIGN KEY (dataset_id)
    REFERENCES geohub.dataset (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID
);

COMMENT ON TABLE geohub.dataset_defaultstyle IS 'This table is to manage the default layer style for each dataset';
COMMENT ON COLUMN geohub.dataset_defaultstyle.dataset_id IS 'md5 hash generated from URL';
COMMENT ON COLUMN geohub.dataset_defaultstyle.layer_id IS 'Layer ID. Band name if it is raster, layer ID if it is vector.';
COMMENT ON COLUMN geohub.dataset_defaultstyle.layer_type IS 'fill, symbol, line, circle, heatmap, raster';
COMMENT ON COLUMN geohub.dataset_defaultstyle.source IS 'JSON object for maplibre source';
COMMENT ON COLUMN geohub.dataset_defaultstyle.style IS 'JSON object for maplibre layer style';
COMMENT ON COLUMN geohub.dataset_defaultstyle.colormap_name IS 'colormap name if it is used';
COMMENT ON COLUMN geohub.dataset_defaultstyle.classification_method IS 'classification method if it is used';
COMMENT ON COLUMN geohub.dataset_defaultstyle.classification_method_2 IS 'classification method if there are two classification settings (icon size, line width) apart from color.';


CREATE TABLE geohub.style
(
  id        serial                   NOT NULL,
  name      character varying        NOT NULL,
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

CREATE TABLE geohub.style_favourite
(
  style_id   integer                  NOT NULL,
  user_email character varying(100)   NOT NULL,
  savedat    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT style_favourite_pkey PRIMARY KEY (style_id, user_email),
  CONSTRAINT "FK_style_TO_style_favourite" FOREIGN KEY (style_id)
    REFERENCES geohub.style (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID
);

COMMENT ON TABLE geohub.style_favourite IS 'this table is to manage users favourite styles';

COMMENT ON COLUMN geohub.style_favourite.style_id IS 'Style ID';

COMMENT ON COLUMN geohub.style_favourite.user_email IS 'user email address';

COMMENT ON COLUMN geohub.style_favourite.savedat IS 'saved datetime';


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

CREATE TABLE geohub.users
(
  id             character varying      NOT NULL,
  user_email     character varying(100) NOT NULL,
  signupat      timestamp with time zone    NOT NULL DEFAULT now(),
  lastaccessedat timestamp with time zone    NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS geohub.users
    OWNER to undpgeohub;

COMMENT ON TABLE geohub.users
    IS 'This table manages the login users information for analysis';

COMMENT ON COLUMN geohub.users.id
    IS 'MD5 hash key from user email address';

COMMENT ON COLUMN geohub.users.user_email
    IS 'Login user email address';

COMMENT ON COLUMN geohub.users.signupat
    IS 'date time when user first time accessed';

COMMENT ON COLUMN geohub.users.lastaccessedat
    IS 'date time when user accessed last time';

CREATE TABLE geohub.stac
(
  id        character varying   NOT NULL,
  name      character varying   NOT NULL,
  url       character varying   NOT NULL,
  type      character varying   NOT NULL,
  providers json,
  createdat  timestamp with time zone NOT NULL DEFAULT now(),,
  created_user character varying(100) NOT NULL,
  updatedat  timestamp with time zone,
  updated_user character varying(100)   ,
  CONSTRAINT stac_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.stac
    IS 'This table is to manage STAC APIs and Catalogs managed in GeoHub';

COMMENT ON COLUMN geohub.stac.id
    IS 'STAC ID';

COMMENT ON COLUMN geohub.stac.name
    IS 'STAC name';

COMMENT ON COLUMN geohub.stac.url
    IS 'STAC API or Catalog.json URL';

COMMENT ON COLUMN geohub.stac.type
    IS 'either api or catalog';

COMMENT ON COLUMN geohub.stac.providers
    IS 'json of array of provider name';
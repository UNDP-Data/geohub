
CREATE TABLE geohub.dataset
(
  id         character varying        NOT NULL,
  storage_id character varying        NOT NULL,
  url        character varying        NOT NULL,
  name       character varying        NOT NULL,
  description     character varying       ,
  is_raster  boolean                  NOT NULL,
  source     character varying       ,
  license    character varying       ,
  bounds     geometry (Polygon, 4326) NOT NULL,
  createdat  timestamp with time zone NOT NULL,
  updatedat  timestamp with time zone,
  PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.dataset IS 'this table manages metadata of files';

COMMENT ON COLUMN geohub.dataset.id IS 'md5 hash generated from URL';

COMMENT ON COLUMN geohub.dataset.storage_id IS 'storage ID';

COMMENT ON COLUMN geohub.dataset.url IS 'stores URL for dataset. e.g., URL for azure blob, URL for mosaicjson';

COMMENT ON COLUMN geohub.dataset.is_raster IS 'raster or vector';

COMMENT ON COLUMN geohub.dataset.source IS 'data source';

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

CREATE TABLE geohub.storage
(
  id          character varying NOT NULL,
  name        character varying NOT NULL,
  url         character varying NOT NULL,
  label       character varying NOT NULL,
  description character varying,
  icon        character varying,
  PRIMARY KEY (id)
);

COMMENT ON TABLE geohub.storage IS 'manges storage';

COMMENT ON COLUMN geohub.storage.id IS 'md5 hash generated from URL';

COMMENT ON COLUMN geohub.storage.name IS 'name';

COMMENT ON COLUMN geohub.storage.label IS 'label for visualising';

COMMENT ON COLUMN geohub.storage.icon IS 'fontawesome icon name or icon URL';

CREATE TABLE geohub.storage_tag
(
  storage_id character varying NOT NULL,
  tag_id     serial            NOT NULL,
  CONSTRAINT storage_tag_pkey PRIMARY KEY (storage_id, tag_id)
);

COMMENT ON TABLE geohub.storage_tag IS 'this table connects between storage and tag';

COMMENT ON COLUMN geohub.storage_tag.storage_id IS 'storage type ID';

COMMENT ON COLUMN geohub.storage_tag.tag_id IS 'unique ID for tag name';

CREATE TABLE geohub.style
(
  id        serial                   NOT NULL,
  name      character varying(100)   NOT NULL,
  style     json                     NOT NULL,
  createdat timestamp with time zone NOT NULL DEFAULT now(),
  updatedat timestamp with time zone NOT NULL DEFAULT now(),
  layers json,
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

ALTER TABLE geohub.dataset
  ADD CONSTRAINT FK_storage_TO_dataset
    FOREIGN KEY (storage_id)
    REFERENCES geohub.storage (id);

ALTER TABLE geohub.storage_tag
  ADD CONSTRAINT FK_tag_TO_storage_tag
    FOREIGN KEY (tag_id)
    REFERENCES geohub.tag (id);

ALTER TABLE geohub.storage_tag
  ADD CONSTRAINT FK_storage_TO_storage_tag
    FOREIGN KEY (storage_id)
    REFERENCES geohub.storage (id);

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
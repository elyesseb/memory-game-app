CREATE TABLE image (
  id serial PRIMARY KEY,
  label varchar(255) NOT NULL,
  url varchar(255) NOT NULL
);

CREATE TABLE score (
  id serial PRIMARY KEY,
  time numeric NOT NULL
);
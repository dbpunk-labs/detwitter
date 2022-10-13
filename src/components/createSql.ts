export const sqlCode = `
create table if not exists following (
    addr varchar(64) primary key,
    name varchar(64),
    ctime timestamp
);

create table if not exists tweets (
  id int primary key,
  ctime timestamp,
  tweet varchar(256)
);

create table if not exists followme (
	addr varchar(64) primary key,
    name varchar(64),
    ctime timestamp
);
`;

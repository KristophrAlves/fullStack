CREATE TABLE IF NOT EXISTS public.drivers (
    id serial NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    vehicle text COLLATE pg_catalog."default",
    rating real,
    rate_per_km real NOT NULL,
    min_km numeric NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT drivers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.rides (
    id serial NOT NULL,
    customer_id integer NOT NULL,
    origin text COLLATE pg_catalog."default" NOT NULL,
    destination text COLLATE pg_catalog."default" NOT NULL,
    distance real NOT NULL,
    duration text COLLATE pg_catalog."default" NOT NULL,
    driver_id integer NOT NULL,
    value real NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rides_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users (
    id serial NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

ALTER TABLE
    IF EXISTS public.rides
ADD
    CONSTRAINT rides_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE
    IF EXISTS public.rides
ADD
    CONSTRAINT rides_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

INSERT INTO
    public.drivers (
        id,
        name,
        description,
        vehicle,
        rating,
        rate_per_km,
        min_km,
        created_at
    )
VALUES
    (
        1,
        'Homer Simpson',
        'Olá! Sou o Homer, seu motorista camarada! Relaxe e aproveite o passeio, com direito a rosquinhas e boas risadas (e talvez alguns desvios).',
        'Plymouth Valiant 1973 rosa e enferrujado',
        2,
        2.5,
        1,
        '2024-11-27 01:11:19.796337'
    ),
    (
        2,
        'Dominic Toretto',
        'Ei, aqui é o Dom. Pode entrar, vou te levar com segurança e rapidez ao seu destino. Só não mexa no rádio, a playlist é sagrada.',
        'Dodge Charger R/T 1970 modificado',
        4,
        5,
        5,
        '2024-11-27 01:11:19.796337'
    ),
    (
        3,
        'James Bond',
        'Boa noite, sou James Bond. À seu dispor para um passeio suave e discreto. Aperte o cinto e aproveite a viagem.',
        'Aston Martin DB5 clássico',
        5,
        10,
        10,
        '2024-11-27 01:11:19.796337'
    );

{ "customer_id": "123",
"origin": "Av. Paulista, São Paulo",
"destination": "Praça da Sé, São Paulo" }
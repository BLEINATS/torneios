/*
          # Tabela de Torneios (tournaments)
          Armazena as informações principais de cada torneio criado.

          ## Query Description: "Cria a tabela principal para armazenar os torneios. A criação desta tabela é segura e não afeta dados existentes, pois é a primeira tabela do esquema."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: tournaments
          - Colunas: id, created_at, name, tournament_type, status, modality, start_date, end_date, courts, background_image, logo_image, colors
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.tournaments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    tournament_type text,
    status text,
    modality text,
    start_date date,
    end_date date,
    courts text[],
    background_image text,
    logo_image text,
    colors jsonb
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for tournaments" ON public.tournaments FOR SELECT USING (true);


/*
          # Tabela de Categorias (categories)
          Armazena as diferentes categorias (ex: Masculino - A, Misto - Iniciante) para cada torneio.

          ## Query Description: "Cria a tabela para as categorias dos torneios. Esta operação depende da tabela 'tournaments' e é segura."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: categories
          - Colunas: id, tournament_id, group, level, prize1, prize2, prize3, max_entries, entry_fee
          - Relacionamentos: Foreign Key para tournaments(id)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id, Foreign Key on tournament_id
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    "group" text,
    level text,
    prize1 text,
    prize2 text,
    prize3 text,
    max_entries integer,
    entry_fee integer
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);


/*
          # Tabela de Equipes/Participantes (teams)
          Armazena os participantes inscritos em cada categoria de um torneio.

          ## Query Description: "Cria a tabela para equipes e participantes. Depende das tabelas 'tournaments' e 'categories'. A operação é segura."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: teams
          - Colunas: id, tournament_id, category_id, name
          - Relacionamentos: Foreign Keys para tournaments(id) e categories(id)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id, Foreign Keys on tournament_id, category_id
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for teams" ON public.teams FOR SELECT USING (true);


/*
          # Tabela de Jogadores (players)
          Armazena os nomes dos jogadores individuais, associados a uma equipe (útil para duplas e equipes).

          ## Query Description: "Cria a tabela para os jogadores. Depende da tabela 'teams'. A operação é segura."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: players
          - Colunas: id, team_id, name
          - Relacionamentos: Foreign Key para teams(id)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id, Foreign Key on team_id
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    name text NOT NULL
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for players" ON public.players FOR SELECT USING (true);


/*
          # Tabela de Partidas (matches)
          Armazena todos os confrontos do torneio, incluindo placares e status.

          ## Query Description: "Cria a tabela para as partidas. Depende das tabelas 'tournaments', 'categories' e 'teams'. A operação é segura."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: matches
          - Colunas: id, tournament_id, category_id, round, court, scheduled_time, status, team1_id, team2_id, team1_score, team2_score
          - Relacionamentos: Foreign Keys para tournaments, categories, e teams
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id, Foreign Keys
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    round integer,
    court text,
    scheduled_time text,
    status text,
    team1_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
    team2_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
    team1_score integer DEFAULT 0,
    team2_score integer DEFAULT 0
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for matches" ON public.matches FOR SELECT USING (true);


/*
          # Tabela de Patrocinadores (sponsors)
          Armazena os patrocinadores de cada torneio.

          ## Query Description: "Cria a tabela para os patrocinadores. Depende da tabela 'tournaments'. A operação é segura."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela: sponsors
          - Colunas: id, tournament_id, name, logo
          - Relacionamentos: Foreign Key para tournaments(id)
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: None for read access
          
          ## Performance Impact:
          - Indexes: Primary Key on id, Foreign Key on tournament_id
          - Triggers: None
          - Estimated Impact: Baixo
          */
CREATE TABLE public.sponsors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    name text NOT NULL,
    logo text
);
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for sponsors" ON public.sponsors FOR SELECT USING (true);

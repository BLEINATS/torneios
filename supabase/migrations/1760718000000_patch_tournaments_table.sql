/*
# [Schema Patch] Atualização da Tabela de Torneios
Este script garante que a tabela `tournaments` contenha todas as colunas necessárias para o funcionamento completo do aplicativo, incluindo datas, horários e personalização de branding.

## Descrição da Consulta:
Esta operação adiciona várias colunas à tabela `tournaments` se elas ainda não existirem. É uma operação segura que não remove dados existentes e apenas estende a estrutura da tabela para corresponder ao que o aplicativo espera.

## Metadados:
- Categoria do Esquema: "Estrutural"
- Nível de Impacto: "Baixo"
- Requer Backup: false
- Reversível: true (removendo as colunas)

## Detalhes da Estrutura:
- Tabela Afetada: `public.tournaments`
- Colunas Adicionadas (se ausentes): `tournamentType`, `status`, `modality`, `startDate`, `endDate`, `startTime`, `endTime`, `courts`, `backgroundImage`, `logoImage`, `colors`.

## Implicações de Segurança:
- Status RLS: Inalterado
- Mudanças de Política: Não
- Requisitos de Autenticação: N/A

## Impacto no Desempenho:
- Índices: Nenhum adicionado ou removido.
- Triggers: Nenhum adicionado ou removido.
- Impacto Estimado: Mínimo. A operação é rápida e não deve impactar o desempenho do banco de dados.
*/

ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS "tournamentType" TEXT,
ADD COLUMN IF NOT EXISTS "status" TEXT,
ADD COLUMN IF NOT EXISTS "modality" TEXT,
ADD COLUMN IF NOT EXISTS "startDate" TEXT,
ADD COLUMN IF NOT EXISTS "endDate" TEXT,
ADD COLUMN IF NOT EXISTS "startTime" TEXT,
ADD COLUMN IF NOT EXISTS "endTime" TEXT,
ADD COLUMN IF NOT EXISTS "courts" TEXT[],
ADD COLUMN IF NOT EXISTS "backgroundImage" TEXT,
ADD COLUMN IF NOT EXISTS "logoImage" TEXT,
ADD COLUMN IF NOT EXISTS "colors" JSONB;

# GERENCIADOR CONECTLABEL PRODUÇÃO

Este repositório contém o sistema de gerenciamento de ordens de serviço da produção para a **ConectLabel**.

## Estrutura do Projeto

O projeto é composto pelos seguintes arquivos principais:

*   **`conectlabel-producao.html`**: Aplicação web em arquivo único contendo o painel interativo (Kamban/Quadro) para gerenciamento de ordens de produção das linhas **Flexo** e **Digital**.
*   **`remixed-3cdd4d5f.tsx`**: Componente em React (TypeScript) contendo a lógica e interface portável do aplicativo de produção.
*   **`conectlabel-producao-2026-07-06.json`**: Dump inicial de dados, contendo a estrutura de etapas e ordens ativas.

## Funcionalidades

*   Visualização de fluxo de trabalho para produção Flexográfica (Kromia, Rebobinadeira, etc.) e Digital (Mimaki, Vicut, etc.).
*   Interface responsiva moderna para gerenciamento de ordens.
*   Cadastro e edição de ordens de serviço (PA, nome, material, quantidade, metragens, observações e responsáveis).
*   Filtros dinâmicos por PA, Nome e Data.
*   Histórico de serviços concluídos.

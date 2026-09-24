/**
 * PokéDex - API Service Layer
 * Responsável pela comunicação com a PokéAPI e normalização dos dados recebidos.
 */
const PokemonAPI = {
    BASE_URL: 'https://pokeapi.co/api/v2/pokemon/',

    /**
     * Busca os dados de um Pokémon pelo seu ID ou nome.
     * Possui tratamento de timeout e retentativas automáticas.
     * 
     * @param {number|string} id - ID ou nome do Pokémon
     * @param {number} retries - Quantidade de tentativas em caso de erro
     * @param {number} timeoutMs - Tempo limite em milissegundos para a requisição
     * @returns {Promise<Object>} Dados normalizados do Pokémon
     */
    async fetchPokemon(id, retries = 2, timeoutMs = 8000) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(`${this.BASE_URL}${id}/`, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status} ao carregar Pokémon #${id}`);
                }

                const rawData = await response.json();
                return this.normalizePokemonData(rawData);
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }
                // Aguarda um pequeno intervalo antes de retentar (backoff exponencial)
                await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
            } finally {
                clearTimeout(timeoutId);
            }
        }
    },

    /**
     * Transforma e normaliza os dados brutos da PokeAPI em um formato limpo
     * e previsível para ser utilizado pela camada de interface (UI).
     * 
     * @param {Object} raw - Dados brutos retornados pela PokéAPI
     * @returns {Object} Objeto do Pokémon padronizado
     */
    normalizePokemonData(raw) {
        const id = raw.id;
        const name = (raw.forms && raw.forms[0] && raw.forms[0].name) ? raw.forms[0].name : raw.name;
        
        // Converte altura de decímetros para metros
        const height = typeof raw.height === 'number' ? raw.height / 10 : 0;
        
        // Converte peso de hectogramas para quilogramas
        const weight = typeof raw.weight === 'number' ? raw.weight / 10 : 0;
        
        // Obtém imagem oficial de alta qualidade (official-artwork) ou fallback padrão
        const imageUrl = (raw.sprites && raw.sprites.other && raw.sprites.other['official-artwork'] && raw.sprites.other['official-artwork'].front_default)
            || (raw.sprites && raw.sprites.front_default)
            || '';

        const types = (raw.types || []).map((item) => item.type.name);
        const abilities = (raw.abilities || []).map((item) => item.ability.name);
        const moves = (raw.moves || []).map((item) => item.move.name);

        return {
            id,
            name,
            height,
            weight,
            imageUrl,
            types,
            abilities,
            moves
        };
    }
};

// Exporta globalmente para compatibilidade direta no navegador
window.PokemonAPI = PokemonAPI;

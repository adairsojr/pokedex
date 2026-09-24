/**
 * PokéDex - Application Controller
 * Orquestrador principal da aplicação.
 * 
 * Resolve o problema de carregamento em ordem aleatória através de um
 * buffer ordenado em fila sequencial (In-Order Sequential Rendering Buffer)
 * combinado a um pool de requisições assíncronas concorrentes.
 */
const PokemonApp = {
    // Configurações da aplicação
    config: {
        startId: 1,
        endId: 151,
        concurrency: 6
    },

    // Estado da execução
    state: {
        nextExpectedId: 1,
        loadedCount: 0,
        totalCount: 0,
        buffer: new Map(),
        isLoading: false
    },

    /**
     * Inicializa a aplicação
     */
    init() {
        PokemonUI.init();

        this.state.totalCount = this.config.endId - this.config.startId + 1;
        this.state.nextExpectedId = this.config.startId;
        this.state.loadedCount = 0;
        this.state.buffer.clear();

        this.loadPokemons();
    },

    /**
     * Inicia o carregamento concorrente dos Pokémons
     */
    async loadPokemons() {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        // Cria a fila ordenada de IDs para carregamento
        const queue = [];
        for (let id = this.config.startId; id <= this.config.endId; id++) {
            queue.push(id);
        }

        // Cria o pool de workers concorrentes
        const workers = Array.from(
            { length: this.config.concurrency },
            () => this.worker(queue)
        );

        await Promise.all(workers);
        this.state.isLoading = false;
    },

    /**
     * Worker que consome IDs da fila e os armazena no buffer ordenado
     * @param {number[]} queue
     */
    async worker(queue) {
        while (queue.length > 0) {
            const id = queue.shift();

            try {
                const pokemon = await PokemonAPI.fetchPokemon(id);
                this.state.buffer.set(id, { success: true, data: pokemon });
            } catch (error) {
                console.error(`Falha ao carregar o Pokémon #${id}:`, error);
                this.state.buffer.set(id, { success: false, error });
            }

            // Após cada término de requisição, tenta descarregar os Pokémons pendentes em estrita ordem
            this.drainBuffer();
        }
    },

    /**
     * Descarrega e renderiza os Pokémons do buffer RIGOROSAMENTE na ordem crescente (1, 2, 3...)
     * 
     * Mesmo que a requisição do Pokémon #2 termine antes do #1, o #2 aguardará no buffer.
     * Assim que o #1 estiver disponível, ele é renderizado e imediatamente seguido pelo #2, #3, etc.
     * Isso elimina 100% de inconsistências de ordem e 'race conditions' causadas pela latência da rede.
     */
    drainBuffer() {
        while (this.state.buffer.has(this.state.nextExpectedId)) {
            const currentId = this.state.nextExpectedId;
            const result = this.state.buffer.get(currentId);
            this.state.buffer.delete(currentId);

            if (result.success) {
                const $card = PokemonUI.createCardElement(result.data, (pokemon) => {
                    PokemonUI.showPokemonModal(pokemon);
                });
                PokemonUI.appendCard($card);
            } else {
                const $errorCard = PokemonUI.createErrorCard(currentId, (id, $col) => {
                    this.retryPokemon(id, $col);
                });
                PokemonUI.appendCard($errorCard);
            }

            this.state.loadedCount++;
            PokemonUI.updateProgressBar(this.state.loadedCount, this.state.totalCount);
            this.state.nextExpectedId++;
        }

        // Se todos os Pokémons foram processados, encerra a barra de progresso
        if (this.state.loadedCount >= this.state.totalCount) {
            PokemonUI.hideProgressBar();
        }
    },

    /**
     * Permite retentar o carregamento de um Pokémon individual que tenha falhado
     * @param {number} id
     * @param {jQuery} $cardContainer
     */
    async retryPokemon(id, $cardContainer) {
        const $btn = $cardContainer.find('.retry-btn');
        $btn.prop('disabled', true).text('Carregando...');

        try {
            const pokemon = await PokemonAPI.fetchPokemon(id, 1);
            const $newCard = PokemonUI.createCardElement(pokemon, (p) => {
                PokemonUI.showPokemonModal(p);
            });
            $cardContainer.replaceWith($newCard);
        } catch (error) {
            console.error(`Nova tentativa falhou para o Pokémon #${id}:`, error);
            $btn.prop('disabled', false).text('Tentar novamente');
        }
    }
};

// Inicializa quando o DOM estiver pronto
$(document).ready(function () {
    PokemonApp.init();
});

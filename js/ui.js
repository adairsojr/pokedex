/**
 * PokéDex - UI / Presentation Layer
 * Responsável pela manipulação do DOM, formatação visual,
 * renderização dos cards, barra de progresso e modal de detalhes.
 */
const PokemonUI = {
    // Cache dos seletores jQuery principais
    elements: {
        $divPokemons: null,
        $divBarraProgresso: null,
        $barraProgresso: null,
        $modalDetalhes: null,
        $modalDetalhesTitulo: null,
        $modalDetalhesBody: null
    },

    /**
     * Inicializa os seletores da interface e eventos globais
     */
    init() {
        this.elements.$divPokemons = $('#divPokemons');
        this.elements.$divBarraProgresso = $('#divBarraProgresso');
        this.elements.$barraProgresso = $('#barraProgresso');
        this.elements.$modalDetalhes = $('#modalDetalhes');
        this.elements.$modalDetalhesTitulo = $('#modalDetalhesTitulo');
        this.elements.$modalDetalhesBody = $('#modalDetalhesBody');

        this.initGlobalEvents();
    },

    /**
     * Configura eventos globais (ex: fechar modal no teclado Esc)
     */
    initGlobalEvents() {
        $(document).on('keydown', (event) => {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.closeModal();
            }
        });
    },

    /**
     * Formata o ID do Pokémon com zeros à esquerda (ex: #001)
     * @param {number|string} id
     * @returns {string}
     */
    formatId(id) {
        return '#' + id.toString().padStart(3, '0');
    },

    /**
     * Formata um valor numérico substituindo ponto por vírgula e incluindo unidade
     * @param {number} value
     * @param {string} unit
     * @returns {string}
     */
    formatNumber(value, unit) {
        if (value === undefined || value === null) return '-';
        return value.toString().replace('.', ',') + ' ' + unit;
    },

    /**
     * Formata uma lista de itens separada por vírgulas e terminada em ponto final
     * @param {string[]} items
     * @returns {string}
     */
    formatList(items) {
        if (!items || items.length === 0) return 'Nenhum.';
        return items.join(', ') + '.';
    },

    /**
     * Cria e retorna o elemento DOM jQuery do Card do Pokémon
     * Mantém o mesmo layout e classes Bootstrap da versão original, com melhorias visuais.
     * 
     * @param {Object} pokemon - Dados normalizados do Pokémon
     * @param {Function} onSelect - Callback disparado ao clicar no card
     * @returns {jQuery} Elemento de coluna contendo o card
     */
    createCardElement(pokemon, onSelect) {
        const formattedId = this.formatId(pokemon.id);

        const $col = $('<div>').addClass('col-xl-2 col-lg-3 col-md-6 col-sm-12 mb-4');
        const $card = $('<div>').addClass('card h-100 shadow-sm pokemon-card');

        const $cardHead = $('<div>').addClass('text-center mt-3');
        const $cardImg = $('<div>').addClass('text-center text-nowrap w-50 rounded-circle bg-danger mx-auto');
        const $img = $('<img>')
            .addClass('card-img-top w-100')
            .attr({
                src: pokemon.imageUrl,
                alt: pokemon.name,
                loading: 'lazy'
            });

        $cardImg.append($img);
        $cardHead.append($cardImg);

        const $cardBody = $('<div>').addClass('card-body d-flex flex-column justify-content-center text-center');
        const $paragrafoId = $('<p>')
            .addClass('card-text font-weight-bold mb-0')
            .text(formattedId);
        const $paragrafoNome = $('<p>')
            .addClass('text-capitalize mt-0 mb-0')
            .text(pokemon.name);

        $cardBody.append($paragrafoId, $paragrafoNome);
        $card.append($cardHead, $cardBody);
        $col.append($card);

        // Evento de clique para abrir os detalhes
        $card.on('click', () => {
            if (typeof onSelect === 'function') {
                onSelect(pokemon);
            }
        });

        return $col;
    },

    /**
     * Cria um card indicando erro de carregamento com opção de retentativa
     * @param {number} id - ID do Pokémon
     * @param {Function} onRetry - Callback disparado ao clicar em tentar novamente
     * @returns {jQuery}
     */
    createErrorCard(id, onRetry) {
        const formattedId = this.formatId(id);
        const $col = $('<div>').addClass('col-xl-2 col-lg-3 col-md-6 col-sm-12 mb-4');
        const $card = $('<div>').addClass('card h-100 shadow-sm border-warning text-center p-3');

        $card.html(`
            <div class="my-auto">
                <p class="font-weight-bold text-muted mb-1">${formattedId}</p>
                <p class="text-danger small mb-2">Erro ao carregar</p>
                <button type="button" class="btn btn-sm btn-outline-secondary retry-btn">Tentar novamente</button>
            </div>
        `);

        $card.find('.retry-btn').on('click', (e) => {
            e.stopPropagation();
            if (typeof onRetry === 'function') {
                onRetry(id, $col);
            }
        });

        $col.append($card);
        return $col;
    },

    /**
     * Adiciona um card ao contêiner de Pokémons
     * @param {jQuery} $cardElement
     */
    appendCard($cardElement) {
        this.elements.$divPokemons.append($cardElement);
    },

    /**
     * Atualiza o estado da barra de progresso
     * @param {number} current - Quantidade de Pokémons processados
     * @param {number} total - Total de Pokémons esperados
     */
    updateProgressBar(current, total) {
        if (!this.elements.$barraProgresso) return;

        const percentage = total > 0 ? Math.ceil((current / total) * 100) : 0;
        this.elements.$barraProgresso
            .attr('aria-valuenow', percentage)
            .css('width', percentage + '%')
            .html(`
                <p class="font-weight-bold my-0 mx-2 text-right">
                    ${current}/${total} (${percentage}%)
                </p>
            `);
    },

    /**
     * Oculta a barra de progresso com animação suave
     */
    hideProgressBar() {
        if (!this.elements.$divBarraProgresso) return;
        this.elements.$divBarraProgresso.fadeOut(400, function () {
            $(this).addClass('d-none');
        });
    },

    /**
     * Renderiza e exibe o modal com todos os detalhes do Pokémon
     * @param {Object} pokemon - Dados do Pokémon
     */
    showPokemonModal(pokemon) {
        const formattedId = this.formatId(pokemon.id);

        // Monta o título do modal
        const $spanId = $('<span>').addClass('font-weight-bold').text(formattedId + ' ');
        const $spanNome = $('<span>').addClass('text-capitalize').text(pokemon.name);
        this.elements.$modalDetalhesTitulo.empty().append($spanId, $spanNome);

        // Monta a imagem central
        const $divImg = $('<div>').addClass('row px-2');
        const $divColImg = $('<div>').addClass('text-center text-nowrap col-xl-4 col-lg-7 col-md-12 col-sm-12 rounded-circle bg-light mx-auto');
        const $img = $('<img>').addClass('card-img-top').attr({
            src: pokemon.imageUrl,
            alt: pokemon.name
        });
        $divColImg.append($img);
        $divImg.append($divColImg);

        // Monta as informações detalhadas
        const $divInfos = $('<div>').addClass('my-3');
        $divInfos.append($('<hr>'));

        // Altura
        $divInfos.append(
            $('<h4>').addClass('font-weight-bold').text('Altura'),
            $('<p>').addClass('ml-5').text(this.formatNumber(pokemon.height, 'm.'))
        );

        // Peso
        $divInfos.append(
            $('<h4>').addClass('font-weight-bold').text('Peso'),
            $('<p>').addClass('ml-5').text(this.formatNumber(pokemon.weight, 'Kg.'))
        );

        // Tipos
        $divInfos.append(
            $('<h4>').addClass('font-weight-bold').text('Tipos'),
            $('<p>').addClass('mx-5 text-capitalize text-justify').text(this.formatList(pokemon.types))
        );

        // Habilidades
        $divInfos.append(
            $('<h4>').addClass('font-weight-bold').text('Habilidades'),
            $('<p>').addClass('mx-5 text-capitalize text-justify').text(this.formatList(pokemon.abilities))
        );

        // Movimentos
        $divInfos.append(
            $('<h4>').addClass('font-weight-bold').text('Movimentos'),
            $('<p>').addClass('mx-5 text-capitalize text-justify').text(this.formatList(pokemon.moves))
        );

        this.elements.$modalDetalhesBody.empty().append($divImg, $divInfos);
        this.elements.$modalDetalhes.modal('show');
    },

    /**
     * Fecha o modal de detalhes
     */
    closeModal() {
        if (this.elements.$modalDetalhes) {
            this.elements.$modalDetalhes.modal('hide');
        }
    }
};

// Exporta globalmente para compatibilidade direta no navegador
window.PokemonUI = PokemonUI;

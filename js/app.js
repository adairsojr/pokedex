$(document).ready(function () {
    var pokemonInicial = 1;
    var pokemonAtual = pokemonInicial;
    var barraProgresso = $("#barraProgresso");
    var divPokemons = $("#divPokemons");
    var interval = setInterval(buscaPokemon, 100);
    var ultimoPokemon = 151;
    async function buscaPokemon() {
        if (pokemonAtual > ultimoPokemon) {
            clearInterval(interval);
            $("#divBarraProgresso").addClass("d-none");
        } else {
            $.ajax({
                url: `https://pokeapi.co/api/v2/pokemon/${pokemonAtual}/`
            }).done(function (pokemon) {
                var id = pokemon.id;
                var nome = pokemon.forms[0].name;
                var altura = pokemon.height / 10;
                var peso = pokemon.weight / 10;
                var urlImg = pokemon.sprites.other["official-artwork"].front_default;
                var tipos = [];

                for (var i = 0; i < pokemon.types.length; i++) {
                    tipos.push(pokemon.types[i].type.name);
                }

                var habilidades = [];

                for (var i = 0; i < pokemon.abilities.length; i++) {
                    habilidades.push(pokemon.abilities[i].ability.name);
                }

                var movimentos = [];

                for (var i = 0; i < pokemon.moves.length; i++) {
                    movimentos.push(pokemon.moves[i].move.name);
                }

                var card = $(document.createElement("div"));
                card.addClass("card mb-4 shadow-sm");

                var cardHead = $(document.createElement("div"));
                cardHead.addClass("text-center mt-3");

                var cardImg = $(document.createElement("div"));
                cardImg.addClass("text-center text-nowrap w-50 rounded-circle bg-danger mx-auto");

                var img = $(document.createElement("img"));
                img.addClass("card-img-top w-100");
                img.attr("src", urlImg);

                cardImg.append(img);
                cardHead.append(cardImg);
                card.append(cardHead);

                var cardBody = $(document.createElement("div"));
                cardBody.addClass("card-body");

                var paragrafoIdPokemon = $(document.createElement("p"));
                paragrafoIdPokemon.addClass("card-text text-center font-weight-bold mb-0");
                paragrafoIdPokemon.append("#" + id.toString().padStart(3, '0'));

                var paragrafoNomePokemon = $(document.createElement("p"));
                paragrafoNomePokemon.addClass("text-capitalize text-center mt-0");
                paragrafoNomePokemon.append(nome);

                cardBody.append(paragrafoIdPokemon, paragrafoNomePokemon);
                card.append(cardBody);

                var divCol = $(document.createElement("div"));
                divCol.addClass("col-xl-2 col-lg-3 col-md-6 col-sm-12");
                divCol.append(card);
                divPokemons.append(divCol);

                if(pokemonAtual <= ultimoPokemon) {
                    var porcentagem = Math.ceil(((pokemonAtual - pokemonInicial) / (ultimoPokemon - pokemonInicial)) * 100);
                    barraProgresso.attr("aria-valuenow", porcentagem);
                    barraProgresso.css("width", porcentagem + "%");

                    var paragrafoBarraProgresso = $(document.createElement("p"));
                    paragrafoBarraProgresso.addClass("font-weight-bold my-0 mx-2 text-right");
                    paragrafoBarraProgresso.append(pokemonAtual + "/" + ultimoPokemon + " (" + porcentagem + "%)");
                    barraProgresso.empty().append(paragrafoBarraProgresso);
                }

                card.click(function () {
                    var spanIdPokemon = $(document.createElement("span"));
                    spanIdPokemon.addClass("font-weight-bold");
                    spanIdPokemon.append("#" + id.toString().padStart(3, '0') + " ");
                    var spanNomePokemon = $(document.createElement("span"));
                    spanNomePokemon.addClass("text-capitalize");
                    spanNomePokemon.append(nome);
                    $("#modalDetalhesTitulo").empty().append(spanIdPokemon, spanNomePokemon);

                    var divImg = $(document.createElement("div"));
                    divImg.addClass("row px-2");

                    var divColImg = $(document.createElement("div"));
                    divColImg.addClass("text-center text-nowrap col-xl-4 col-lg-7 col-md-12 col-sm-12 rounded-circle bg-light mx-auto");
                    divImg.append(divColImg);

                    var img = $(document.createElement("img"));
                    img.addClass("card-img-top");
                    img.attr("src", urlImg);

                    divColImg.append(img);

                    var divInfos = $(document.createElement("div"));
                    divInfos.addClass("my-3");
                    var hrInfos = $(document.createElement("hr"));
                    divInfos.append(hrInfos);

                    var tituloAltura = $(document.createElement("h4"));
                    tituloAltura.addClass("font-weight-bold");
                    tituloAltura.append("Altura");
                    divInfos.append(tituloAltura);
                    var paragrafoAltura = $(document.createElement("p"));
                    paragrafoAltura.addClass("ml-5");
                    paragrafoAltura.append(altura.toString().replace(".", ",") + " m.");
                    divInfos.append(paragrafoAltura);

                    var tituloPeso = $(document.createElement("h4"));
                    tituloPeso.addClass("font-weight-bold");
                    tituloPeso.append("Peso");
                    divInfos.append(tituloPeso);
                    var paragrafoPeso = $(document.createElement("p"));
                    paragrafoPeso.addClass("ml-5");
                    paragrafoPeso.append(peso.toString().replace(".", ",") + " Kg.");
                    divInfos.append(paragrafoPeso);

                    var tituloTipos = $(document.createElement("h4"));
                    tituloTipos.addClass("font-weight-bold");
                    tituloTipos.append("Tipos");
                    divInfos.append(tituloTipos);
                    var paragrafoTipos = $(document.createElement("p"));
                    paragrafoTipos.addClass("mx-5 text-capitalize text-justify");

                    for (var i = 0; i < tipos.length; i++) {
                        paragrafoTipos.append(tipos[i]);
                        if (i < tipos.length - 1) {
                            paragrafoTipos.append(", ");
                        } else {
                            paragrafoTipos.append(".");
                        }
                    }

                    divInfos.append(paragrafoTipos);

                    var tituloHabilidades = $(document.createElement("h4"));
                    tituloHabilidades.addClass("font-weight-bold");
                    tituloHabilidades.append("Habilidades");
                    divInfos.append(tituloHabilidades);
                    var paragrafoHabilidades = $(document.createElement("p"));
                    paragrafoHabilidades.addClass("mx-5 text-capitalize text-justify");

                    for (var i = 0; i < habilidades.length; i++) {
                        paragrafoHabilidades.append(habilidades[i]);
                        if (i < habilidades.length - 1) {
                            paragrafoHabilidades.append(", ");
                        } else {
                            paragrafoHabilidades.append(".");
                        }
                    }

                    divInfos.append(paragrafoHabilidades);

                    var tituloMovimentos = $(document.createElement("h4"));
                    tituloMovimentos.addClass("font-weight-bold");
                    tituloMovimentos.append("Movimentos");
                    divInfos.append(tituloMovimentos);
                    var paragrafoMovimentos = $(document.createElement("p"));
                    paragrafoMovimentos.addClass("mx-5 text-capitalize text-justify");

                    for (var i = 0; i < movimentos.length; i++) {
                        paragrafoMovimentos.append(movimentos[i]);
                        if (i < movimentos.length - 1) {
                            paragrafoMovimentos.append(", ");
                        } else {
                            paragrafoMovimentos.append(".");
                        }
                    }

                    divInfos.append(paragrafoMovimentos);

                    $("#modalDetalhesBody").empty().append(divImg, divInfos);

                    $("#modalDetalhes").modal();
                });
            });

            pokemonAtual++;
        }
    }
});

$(document).keydown(function (event) {
    if (event.keyCode == 27) {
        $('#modalDetalhes').modal('hide');
    }
});

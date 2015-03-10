'use strict';

var app = angular.module('aguas', []);

app.controller('AguasController', ['$scope', '$rootScope', '$http',

    function($scope, $rootScope, $http) {

        jQuery(document).foundation();

        $scope.searchField = "";
        $scope.vis;
        $scope.map;
        $scope.layers;
        $scope.sql;

        $scope.initMap = function() {
            $scope.sql = new cartodb.SQL({
                user: 'cartodb_user'
            });

            cartodb.createVis('map_canvas', 'http://oxcarh.cartodb.com/api/v2/viz/832bc024-c525-11e4-968e-0e853d047bba/viz.json')
            .done(function(vis, layers) {
                $scope.vis = vis;
                $scope.map = $scope.vis.getNativeMap();
                $scope.layers = layers;

                var layer0 = $scope.layers[0];
                var layer1 = $scope.layers[1];

                layer1.on('featureClick', function(e, pos, latlng, data) {
                        //$scope.map.panTo(pos);
                        $scope.zoomOnColonia(data.cp);
                    });
            })
            .error(function(message) {
                alert("No se pudo cargar el mapa")
            });

            jQuery('input#search-field').autoComplete({
                minChars: 2,
                source: function(term, suggest) {
                    if (term.length > 2) {
                        $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT * FROM colonias_df where sett_name ilike '%25" + term + "%25'")
                        .success(function(data) {
                            var matches = [];
                            for (var i = 0; i < data.rows.length; i++) {
                                if (matches.length < 5) {
                                    matches.push(data.rows[i].sett_name);
                                }
                            }
                            suggest(matches);
                        })
                        .error(function(data, status) {
                            alert('Error: ' + data + ' :' + status);
                        });
                    }
                }
            });

        };

        $scope.zoomOnColonia = function(postalCode) {
            $scope.showColoniaMeta(postalCode);
            $scope.showColoniaData(postalCode);
            $scope.socialIcons(postalCode);
        };

        $scope.facebookLink = "http://www.facebook.com/sharer.php?u=http://cdb.io/1aTLOCC&amp;t=En mi colonia hay un problema de agua y pone en riesgo mi salud. Ayúdame a resolverlo %23aguasgüey";
        $scope.twitterLink = "http://twitter.com/share?url=http://cdb.io/1aTLOCC&amp;text=En mi colonia hay un problema de agua y pone en riesgo mi salud. Ayúdame a resolverlo %23aguasgüey";

        $scope.socialIcons = function(postalCode) {
            $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT mun_name FROM colonias_df where cp='" + postalCode + "'")
            .success(function(data) {
                var colonia = data.rows[0];
                $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT * FROM delegados where nom_delegacion ilike '" + colonia.mun_name + "'")
                .success(function(data) {
                    console.log(data.rows[0]);
                    var facebook = "http://www.facebook.com/sharer.php?u=http://cdb.io/1aTLOCC&amp;t=";
                    var twitter = "http://twitter.com/share?url=http://cdb.io/1aTLOCC&amp;text=";
                    $scope.facebookLink = facebook + data.rows[0].twitter_personal + " En mi colonia hay un problema de agua y pone en riesgo mi salud. Ayúdame a resolverlo %23aguasgüey";
                    $scope.twitterLink = twitter + data.rows[0].twitter_personal + " En mi colonia hay un problema de agua y pone en riesgo mi salud. Ayúdame a resolverlo %23aguasgüey";
                    console.log($scope.facebookLink);
                    console.log($scope.twitterLink);
                })
                .error(function(data, status) {
                    alert('Error: ' + data + ' :' + status);
                });          
            })
            .error(function(data, status) {
                alert('Error: ' + data + ' :' + status);
            });
        };

        $scope.showColoniaMeta = function(postalCode) {
            //$http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT Box2D(the_geom),ST_Y(ST_Centroid(the_geom)) latitude, ST_X(ST_Centroid(the_geom)) longitude FROM colonias_df where cp='" + postalCode + "'")
            $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT ST_XMin(Box2D(the_geom)) xmin, ST_YMin(Box2D(the_geom)) ymin, ST_XMax(Box2D(the_geom)) xmax, ST_YMax(Box2D(the_geom)) ymax FROM colonias_df where cp='" + postalCode + "'")
            .success(function(data) {
                var colonia = data.rows[0];
                var bounds = [
                [colonia.ymin, colonia.xmin],
                [colonia.ymax, colonia.xmax]
                ];
                $scope.map.fitBounds(bounds);
            })
            .error(function(data, status) {
                alert('Error: ' + data + ' :' + status);
            });
        };

        $scope.showColoniaData = function(postalCode) {
            $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT * FROM ranking_chingon where cp='" + postalCode + "'")
            .success(function(data) {
                var colonia = data.rows[0];
                    // Acceso a drenaje y agua potable
                    if (null != colonia.adecuacinsanitaria) {
                        var adecuacionSanitaria = jQuery.number(colonia.adecuacinsanitaria * 100, 1);
                        $scope.adecuacionSanitaria = adecuacionSanitaria + "%"
                        $scope.adecuacionSanitariaStyle = $scope.translateRankingStyle(colonia.fadecuacinsanitaria, "grifo");
                    } else {
                        $scope.adecuacionSanitaria = "";
                        $scope.adecuacionSanitariaStyle = $scope.translateRankingStyle(0, "grifo");
                    }

                    // Reportes de escasez de agua
                    $scope.reporteFaltaAgua = $scope.translateRanking(colonia.freporte_falta_agua);
                    $scope.reporteFaltaAguaStyle = $scope.translateRankingStyle(colonia.freporte_falta_agua, "vaso");
                    // Reportes inundaciones
                    $scope.reportesRetio = $scope.translateRanking(colonia.freportesretio);
                    $scope.reportesRetioStyle = $scope.translateRankingStyle(colonia.freportesretio, "inundado");
                    // Drenajes expuestos
                    $scope.aguaResidual = colonia.faguaresidual == 5 ? "Si" : "No";
                    $scope.aguaResidualStyle = $scope.translateRankingStyle(colonia.faguaresidual, "drenaje");
                    // Basureros clandestinos
                    $scope.basureros = colonia.fbasureros == 5 ? "Si" : "No";
                    $scope.basurerosStyle = $scope.translateRankingStyle(colonia.fbasureros, "basura");
                })
.error(function(data, status) {
    alert('Error: ' + data + ' :' + status);
});
};

$scope.search = function() {
    if (jQuery.isNumeric($scope.searchField)) {
        $scope.zoomOnColonia($scope.searchField);
    } else {
        $http.get("http://oxcarh.cartodb.com/api/v2/sql?q=SELECT * FROM colonias_df where sett_name like '%25" + jQuery("#search-field").val() + "%25'")
        .success(function(data) {
         $scope.zoomOnColonia(data.rows[0].cp);
     })
        .error(function(data, status) {
            alert('Error: ' + data + ' :' + status);
        });
    }
};

$scope.translateRanking = function(ranking) {
    var translation = "";
    if (5 == ranking) {
        translation = "Muy Alto";
    } else if (4 == ranking) {
        translation = "Alto";
    } else if (3 == ranking) {
        translation = "Medio";
    } else if (2 == ranking) {
        translation = "Bajo";
    } else if (1 == ranking) {
        translation = "Muy Bajo";
    }
    return translation;
};

$scope.translateRankingStyle = function(ranking, imagen) {
    var style = {
        "background-color": "#ccc"
    };
    if (5 == ranking && "grifo" == imagen) {
        style = {
                    //"background-color": "#ff1d25"
                    "background-color": "#cf1920",
                    "background-image": "url(http://localhost:8000/img/grifo-5.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (5 == ranking && "inundado" == imagen) {
                style = {
                    //"background-color": "#ff1d25"
                    "background-color": "#cf1920",
                    "background-image": "url(http://localhost:8000/img/inundado-5.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (5 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#cf1920",
                    "background-image": "url(http://localhost:8000/img/vaso-5.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (5 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#cf1920",
                    "background-image": "url(http://localhost:8000/img/desague-5.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (5 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#cf1920",
                    "background-image": "url(http://localhost:8000/img/basura-5.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (4 == ranking && "grifo" == imagen) {
                style = {
                    "background-color": "#ce432e",
                    "background-image": "url(http://localhost:8000/img/grifo-4.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (4 == ranking && "inundado" == imagen) {
                style = {
                    "background-color": "#ce432e",
                    "background-image": "url(http://localhost:8000/img/inundado-4.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (4 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#ce432e",
                    "background-image": "url(http://localhost:8000/img/vaso-4.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (4 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#ce432e",
                    "background-image": "url(http://localhost:8000/img/drenaje-4.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (4 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#ce432e",
                    "background-image": "url(http://localhost:8000/img/basura-4.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (3 == ranking && "grifo" == imagen) {
                style = {
                    "background-color": "#9c6938",
                    "background-image": "url(http://localhost:8000/img/grifo-3.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (3 == ranking && "inundado" == imagen) {
                style = {
                    "background-color": "#9c6938",
                    "background-image": "url(http://localhost:8000/img/inundado-3.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (3 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#9c6938",
                    "background-image": "url(http://localhost:8000/img/vaso-3.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (3 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#9c6938",
                    "background-image": "url(http://localhost:8000/img/drenaje-3.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (3 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#9c6938",
                    "background-image": "url(http://localhost:8000/img/basura-3.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (2 == ranking && "grifo" == imagen) {
                style = {
                    "background-color": "#6d8f41",
                    "background-image": "url(http://localhost:8000/img/grifo-2.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (2 == ranking && "inundado" == imagen) {
                style = {
                    "background-color": "#6d8f41",
                    "background-image": "url(http://localhost:8000/img/inundado-2.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (2 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#6d8f41",
                    "background-image": "url(http://localhost:8000/img/vaso-2.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (2 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#6d8f41",
                    "background-image": "url(http://localhost:8000/img/drenaje-2.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (2 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#6d8f41",
                    "background-image": "url(http://localhost:8000/img/basura-2.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (1 == ranking && "grifo" == imagen) {
                style = {
                    "background-color": "#2fae3d",
                    "background-image": "url(http://localhost:8000/img/grifo-1.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (1 == ranking && "inundado" == imagen) {
                style = {
                    "background-color": "#2fae3d",
                    "background-image": "url(http://localhost:8000/img/inundado-1.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (1 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#2fae3d",
                    "background-image": "url(http://localhost:8000/img/vaso-1.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (1 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#2fae3d",
                    "background-image": "url(http://localhost:8000/img/desague-1.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (1 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#2fae3d",
                    "background-image": "url(http://localhost:8000/img/basura-1.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (0 == ranking && "grifo" == imagen) {
                style = {
                    "background-color": "#ccc",
                    "background-image": "url(http://localhost:8000/img/grifo-gris.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (0 == ranking && "inundado" == imagen) {
                style = {
                    "background-color": "#ccc",
                    "background-image": "url(http://localhost:8000/img/inundado-gris.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (0 == ranking && "vaso" == imagen) {
                style = {
                    "background-color": "#ccc",
                    "background-image": "url(http://localhost:8000/img/vaso-gris.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (0 == ranking && "drenaje" == imagen) {
                style = {
                    "background-color": "#ccc",
                    "background-image": "url(http://localhost:8000/img/desague-gris.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            } else if (0 == ranking && "basura" == imagen) {
                style = {
                    "background-color": "#ccc",
                    "background-image": "url(http://localhost:8000/img/basura-gris.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "50% 50%"
                };
            }
            return style;
        };

        $scope.showModal = function(id) {
            console.log(jQuery('#' + id));
            jQuery('#' + id).foundation('reveal', 'open');
        }

        $scope.adecuacionSanitaria = "";
        $scope.aguaResidual = "";
        $scope.basureros = "";
        $scope.reportesRetio = "";
        $scope.reporteFaltaAgua = "";

        $scope.adecuacionSanitariaStyle = $scope.translateRankingStyle(0, "grifo");
        $scope.aguaResidualStyle = $scope.translateRankingStyle(0, "drenaje");
        $scope.basurerosStyle = $scope.translateRankingStyle(0, "basura");
        $scope.reportesRetioStyle = $scope.translateRankingStyle(0, "inundado");
        $scope.reporteFaltaAguaStyle = $scope.translateRankingStyle(0, "vaso");

    }
    ]);

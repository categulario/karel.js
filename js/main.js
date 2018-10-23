$(document)
    .ready(function() {
      function getParser(str) {
        language = detectLanguage(str);

        switch (language) {
          case 'pascal':
            return {parser: new karelpascal.Parser(), name: 'pascal'};
            break;
          case 'java':
            return {parser: new kareljava.Parser(), name: 'java'};
            break;
          case 'ruby':
            return {parser: new karelruby.Parser(), name: 'ruby'};
            break;
          default:
            return {parser: new kareljava.Parser(), name: 'pascal'};
            break;
        }
      }

      function parseError(str, hash) {
        if (hash.recoverable) {
          this.trace(str);
        } else {
          var e = new Error(str);
          for (var n in hash) {
            if (hash.hasOwnProperty(n)) {
              e[n] = hash[n];
            }
          }
          e.text = e.text;
          var line = editor.getLine(e.line);
          var i = line.indexOf(e.text, hash.loc ? hash.loc.first_column : 0);
          if (i == -1) {
            i = line.indexOf(e.text);
          }
          if (i != -1) {
            e.loc = {
              first_line: e.line,
              last_line: e.line,
              first_column: i,
              last_column: i + e.text.length
            };
          } else {
            e.loc = {
              first_line: e.line,
              last_line: e.line + 1,
              first_column: 0,
              last_column: 0
            };
          }
          throw e;
        }
      }

      function getSyntax(str) {
        var parser = getParser(str);
        parser.parser.yy.parseError = parseError;
        return parser;
      }

      function parseWorld(xml) {
        // Parses the xml and returns a document object.
        return new DOMParser().parseFromString(xml, 'text/xml');
      }

      function htmlEscape(s) {
        return s.replace(/</g, '&lt;').replace(/</g, '&gt;');
      }

      function modalPrompt(label, value, options) {
        // shows a modal that asks for someting  and returns a promise that
        // resolves to the selected or provided value
      }

      var ERROR_CODES = {
        'WALL': 'Karel ha chocado con un muro!',
        'WORLDUNDERFLOW':
            'Karel intentó tomar zumbadores en una posición donde no había!',
        'BAGUNDERFLOW':
            'Karel intentó dejar un zumbador pero su mochila estaba vacía!',
        'INSTRUCTION': 'Karel ha superado el límite de instrucciones!',
        'STACK': 'La pila de karel se ha desbordado!'
      };

      var COMPILATION_ERROR = 'Error de compilación';

      var ERROR_TOKENS = {
        pascal: {
          BEGINPROG: '"iniciar-programa"',
          BEGINEXEC: '"inicia-ejecución"',
          ENDEXEC: '"termina-ejecución"',
          ENDPROG: '"finalizar-programa"',
          DEF: '"define-nueva-instrucción"',
          PROTO: '"define-prototipo-instrucción"',
          RET: '"sal-de-instrucción"',
          AS: '"como"',
          HALT: '"apágate"',
          LEFT: '"gira-izquierda"',
          FORWARD: '"avanza"',
          PICKBUZZER: '"coge-zumbador"',
          LEAVEBUZZER: '"deja-zumbador"',
          BEGIN: '"inicio"',
          END: '"fin"',
          THEN: '"entonces"',
          WHILE: '"mientras"',
          DO: '"hacer"',
          REPEAT: '"repetir"',
          TIMES: '"veces"',
          DEC: '"precede"',
          INC: '"sucede"',
          IFZ: '"si-es-cero"',
          IFNFWALL: '"frente-libre"',
          IFFWALL: '"frente-bloqueado"',
          IFNLWALL: '"izquierda-libre"',
          IFLWALL: '"izquierda-bloqueada"',
          IFNRWALL: '"derecha-libre"',
          IFRWALL: '"derecha-bloqueada"',
          IFWBUZZER: '"junto-a-zumbador"',
          IFNWBUZZER: '"no-junto-a-zumbador"',
          IFBBUZZER: '"algún-zumbador-en-la-mochila"',
          IFNBBUZZER: '"ningún-zumbador-en-la-mochila"',
          IFN: '"orientado-al-norte"',
          IFS: '"orientado-al-sur"',
          IFE: '"orientado-al-este"',
          IFW: '"orientado-al-oeste"',
          IFNN: '"no-orientado-al-norte"',
          IFNS: '"no-orientado-al-sur"',
          IFNE: '"no-orientado-al-este"',
          IFNW: '"no-orientado-al-oeste"',
          ELSE: '"si-no"',
          IF: '"si"',
          NOT: '"no"',
          OR: '"o"',
          AND: '"y"', '(': '"("', ')': '")"', ';': '";"',
          NUM: 'un número',
          VAR: 'un nombre',
          EOF: 'el final del programa'
        },
        java: {
          CLASS: '"class"',
          PROG: '"program"',
          DEF: '"define"',
          DEF: '"void"',
          RET: '"return"',
          HALT: '"turnoff"',
          LEFT: '"turnleft"',
          FORWARD: '"move"',
          PICKBUZZER: '"pickbeeper"',
          LEAVEBUZZER: '"putbeeper"',
          WHILE: '"while"',
          REPEAT: '"iterate"',
          DEC: '"pred"',
          INC: '"succ"',
          IFZ: '"iszero"',
          IFNFWALL: '"frontIsClear"',
          IFFWALL: '"frontIsBlocked"',
          IFNLWALL: '"leftIsClear"',
          IFLWALL: '"leftIsBlocked"',
          IFNRWALL: '"rightIsClear"',
          IFRWALL: '"rightIsBlocked"',
          IFWBUZZER: '"nextToABeeper"',
          IFNWBUZZER: '"notNextToABeeper"',
          IFBBUZZER: '"anyBeepersInBeeperBag"',
          IFNBBUZZER: '"noBeepersInBeeperBag"',
          IFN: '"facingNorth"',
          IFS: '"facingSouth"',
          IFE: '"facingEast"',
          IFW: '"facingWest"',
          IFNN: '"notFacingNorth"',
          IFNS: '"notFacingSouth"',
          IFNE: '"notFacingEast"',
          IFNW: '"notFacingWest"',
          ELSE: '"else"',
          IF: '"if"',
          NOT: '"!"',
          OR: '"||"',
          AND: '"&&"',
          AND: '"&"', '(': '"("', ')': '")"',
          BEGIN: '"{"',
          END: '"}"', ';': '";"',
          NUM: 'un número',
          VAR: 'un nombre',
          EOF: 'el final del programa'
        },
      };

      // Preparación del editor
      var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        // editor options
      });

      function validatorCallbacks(message) {
        if (message.type == 'error') {
          $('#mensajes').trigger('error', {mensaje: message.message});
        } else if (message.type == 'info') {
          $('#mensajes').trigger('info', {mensaje: message.message});
        } else if (message.type == 'invalidCell') {
          $('#mensajes')
              .trigger('error', {
                mensaje: 'La celda (' + message.x + ', ' + message.y +
                             ') es inválida'
              });
        } else {
          console.error('Mensaje no reconocido', message);
        }
      }

      var canvas = $('#world')[0];
      var h = 100;
      var w = 100;
      var context = canvas.getContext('2d');
      var wRender = new WorldRender(context, h, w);
      var borrar_zumbadores = false;
      var zumbadores_anterior = 0;
      var fila_evento;
      var columna_evento;
      var mundo = new World(w, h);

      if (location.hash == '#debug') {
        mundo.runtime.debug = true;
      }

      var mundo_editable = true;
      var linea_actual = null;
      var tab_actual = 'mensajes';
      var mensajes_no_leidos = 0;
      var currentCell = undefined;
      var src = null;

      // load a parsed xml world
      mundo.load(parseWorld(src));

      // set width and repaint
      $('#world').attr('width', $('#world').width());
      wRender.paint(mundo, canvas.width, canvas.height,
                    {editable: mundo_editable});

      var interval = null;

      function highlightCurrentLine() {
        // logic to highlight a given line in the editor
      }

      function step() {
        // Avanza un paso en la ejecución del código
        mundo.runtime.step();

        highlightCurrentLine();

        if (mundo.dirty) {
          mundo.dirty = false;
          wRender.paint(mundo, canvas.width, canvas.height, {track_karel: true});
        }

        if (!mundo.runtime.state.running) {
          clearInterval(interval);
          interval = null;
          highlightCurrentLine();
        }
      }

      function compile() {
        var syntax = getSyntax(editor.getValue());

        try {
          var compiled = syntax.parser.parse(editor.getValue());
          return compiled;
        } catch (e) {
          if (e.expected) {
            // error con tratamiento?
          } else {
            // errores sin tratar?
          }

          // place a marker in the editor where the syntax error ocurred
          // select the errored lines in the editor
          return null;
        }
      }

      $('#ejecutar')
          .click(function(event) {
            if ($('#ejecutar em').hasClass('icon-play')) {
              if (mundo_editable) {
                var compiled = compile();
                if (compiled != null) {
                  $('#ejecutar').trigger('lock');

                  mundo.reset();
                  mundo.runtime.load(compiled);
                  mundo.preValidate(validatorCallbacks)
                      .then(
                          function(didValidation) {
                            if (didValidation) {
                              $('#mensajes')
                                  .trigger(
                                      'success',
                                      {'mensaje': 'La validación fue exitosa'});
                            }
                            mundo.runtime.start();
                            interval =
                                setInterval(step, $('#retraso_txt').val());
                          },
                          function(message) {
                            $('#mensajes')
                                .trigger('error', {
                                  'mensaje': 'La validación falló' +
                                                 (message ? ': ' + message : '')
                                });
                            $('#ejecutar').trigger('unlock');
                            compiled = null;
                          });
                }
              } else {
                $('#ejecutar').trigger('lock');
                interval = setInterval(step, $('#retraso_txt').val());
              }
            } else {
              clearInterval(interval);
              $('#ejecutar em').removeClass('icon-pause').addClass('icon-play');
              $('#worldclean').removeAttr('disabled');
              $('#paso').removeAttr('disabled');
              $('#evaluacion').removeAttr('disabled');
            }
          });

      $('#paso')
          .click(function(event) {
            if (!mundo_editable) {
              step();
              return;
            }
            var compiled = compile();
            if (compiled != null) {
              $('#ejecutar').trigger('lock');

              mundo.reset();
              mundo.runtime.load(compiled);
              mundo.preValidate(validatorCallbacks)
                  .then(
                      function(didValidation) {
                        if (didValidation) {
                          $('#mensajes')
                              .trigger(
                                  'success',
                                  {'mensaje': 'La validación fue exitosa'});
                        }
                        mundo.runtime.start();
                        $('#paso').removeAttr('disabled');
                        $('#worldclean').removeAttr('disabled');
                        $('#evaluacion').removeAttr('disabled');
                        $('#ejecutar em')
                            .removeClass('icon-pause')
                            .addClass('icon-play');
                        step();
                      },
                      function(message) {
                        $('#mensajes')
                            .trigger('error', {
                              'mensaje': 'La validación falló' +
                                             (message ? ': ' + message : '')
                            });
                        $('#ejecutar').trigger('unlock');
                        compiled = null;
                      });
            }
          });

      function guardarMochila() {
        var valor = parseInt($('#mochila').val(), 10);
        if (Number.isNaN(valor) || valor < 0 || valor > 65534) {
          return;
        }
        mundo.setBagBuzzers(valor);
        $('#xmlMundo').html(mundo.save());
      }

      $('#mochila').keyup(guardarMochila).blur(function() {
            guardarMochila();
            $('#mochila').val(mundo.bagBuzzers);
          });

      $('#codesave')
          .click(function(event) {
            $('#guardar_modal').modal('show');
            $('#guardar_salida').html(htmlEscape(editor.getValue()));
            var blob = new Blob([editor.getValue()], {'type': 'text/xml'});
            $('#guardar_descargar')
                .attr('href', window.URL.createObjectURL(blob))
                .attr('download', 'karel.txt');
          });

      $('#worldclean')
          .click(function(event) {
            if (linea_actual != null) {
              editor.removeLineClass(linea_actual, 'background',
                                     'karel-current-line');
            }

            $('#ejecutar').trigger('unlock');
            $('#pila').html('');
            var src = null;
            if (document.location.hash.indexOf('#mundo:') === 0) {
              src = decodeURIComponent(document.location.hash.substring(7));
            } else {
              src = $('script#xmlMundo').html();
            }
            mundo.load(parseWorld(src));

            if ($('#filas').val() != mundo.h ||
                $('#columnas').val() != mundo.w) {
              $('#filas').val(mundo.h);
              h = mundo.h;
              $('#columnas').val(mundo.w);
              w = mundo.w;
              wRender = new WorldRender(context, h, w);
            }

            if (mundo.bagBuzzers == -1 !=
                $('#inf_zumbadores').hasClass('active')) {
              $('#inf_zumbadores').toggleClass('active');
            }
            if (mundo.bagBuzzers == -1) {
              $('#mochila').val('').attr('disabled', 'disabled');
            } else {
              $('#mochila').val(mundo.bagBuzzers).removeAttr('disabled');
            }
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: true, track_karel: true});
            if ($('#posicion_karel').hasClass('active') !=
                mundo.getDumps(World.DUMP_POSITION)) {
              $('#posicion_karel').button('toggle');
            }
            if ($('#orientacion_karel').hasClass('active') !=
                mundo.getDumps(World.DUMP_ORIENTATION)) {
              $('#orientacion_karel').button('toggle');
            }
            if ($('#mochila_karel').hasClass('active') !=
                mundo.getDumps(World.DUMP_BAG)) {
              $('#mochila_karel').button('toggle');
            }
            if ($('#universo').hasClass('active') !=
                mundo.getDumps(World.DUMP_ALL_BUZZERS)) {
              $('#universo').button('toggle');
            }
            if ($('#dump_avanza').hasClass('active') !=
                mundo.getDumps(World.DUMP_MOVE)) {
              $('#dump_avanza').button('toggle');
            }
            if ($('#dump_gira_izquierda').hasClass('active') !=
                mundo.getDumps(World.DUMP_LEFT)) {
              $('#dump_gira_izquierda').button('toggle');
            }
            if ($('#dump_coge_zumbador').hasClass('active') !=
                mundo.getDumps(World.DUMP_PICK_BUZZER)) {
              $('#dump_coge_zumbador').button('toggle');
            }
            if ($('#dump_deja_zumbador').hasClass('active') !=
                mundo.getDumps(World.DUMP_LEAVE_BUZZER)) {
              $('#dump_deja_zumbador').button('toggle');
            }
          });

      $('#newworld')
          .click(function(event) {
            if (linea_actual != null) {
              editor.removeLineClass(linea_actual, 'background',
                                     'karel-current-line');
            }
            mundo = new World(w, h);
            $('#ejecutar').trigger('unlock');
            mundo.reset();
            if (location.hash == '#debug') {
              mundo.runtime.debug = true;
            }
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: true, track_karel: true});
            $('#xmlMundo').html(mundo.save());
            if ($('#posicion_karel').hasClass('active')) {
              $('#posicion_karel').button('toggle');
            }
            if ($('#orientacion_karel').hasClass('active')) {
              $('#orientacion_karel').button('toggle');
            }
            if ($('#inf_zumbadores').hasClass('active')) {
              $('#inf_zumbadores').button('toggle');
            }
            if ($('#mochila_karel').hasClass('active')) {
              $('#mochila_karel').button('toggle');
            }
            if ($('#universo').hasClass('active')) {
              $('#universo').button('toggle');
            }
            if ($('#dump_avanza').hasClass('active')) {
              $('#dump_avanza').button('toggle');
            }
            if ($('#dump_gira_izquierda').hasClass('active')) {
              $('#dump_gira_izquierda').button('toggle');
            }
            if ($('#dump_coge_zumbador').hasClass('active')) {
              $('#dump_coge_zumbador').button('toggle');
            }
            if ($('#dump_deja_zumbador').hasClass('active')) {
              $('#dump_deja_zumbador').button('toggle');
            }
          });

      $('#world')
          .bind('contextmenu', function(event) {
            // Maneja el click derecho sobre el mundo
            if (mundo_editable) {
              var x = event.pageX;
              var y = event.pageY;

              columna_evento =
                  Math.floor(event.offsetX / wRender.tamano_celda) +
                  wRender.primera_columna - 1;
              fila_evento = Math.floor((canvas.height - event.offsetY) /
                                       wRender.tamano_celda) +
                            wRender.primera_fila - 1;

              if (y + $('#wcontext_menu').height() > $(window).height()) {
                y -= $('#wcontext_menu').height();
              }
              if (x + $('#wcontext_menu').width() > $(window).width()) {
                x -= $('#wcontext_menu').width();
              }

              $('#wcontext_menu')
                  .css({top: y + 'px', left: x + 'px', display: 'block'});
              return false;
            }
          });

      $('#world')
          .hammer()
          .on('drag', function(event) {
            var x = event.gesture.deltaX % 2;
            var y = event.gesture.deltaY % 2;

            if (event.gesture.deltaX < 0 &&
                (wRender.primera_columna + wRender.num_columnas) < w + 2 &&
                x == 0) {
              wRender.primera_columna += 1;
            } else if (event.gesture.deltaX > 0 &&
                       wRender.primera_columna > 1 && x == 0) {
              wRender.primera_columna -= 1;
            }

            if (event.gesture.deltaY > 0 &&
                (wRender.primera_fila + wRender.num_filas) < h + 2 && y == 0) {
              wRender.primera_fila += 1;
            } else if (event.gesture.deltaY < 0 && wRender.primera_fila > 1 &&
                       y == 0) {
              wRender.primera_fila -= 1;
            }

            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
          });

      $('#world')
          .hammer()
          .on('release', function(event) { event.gesture.preventDefault(); });

      $('#world').on('mouseup', function(event) { event.preventDefault(); });

      Hammer($('#world'))
          .on('dragstart', function(event) {
            $(document.body).css('cursor', 'move');
          });

      Hammer($('#world'))
          .on('dragend', function(event) {
            $(document.body).css('cursor', 'auto');
            currentCell = undefined;
          });

      $('#go_home')
          .click(function(event) {
            wRender.primera_fila = 1;
            wRender.primera_columna = 1;
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
          });

      $('#follow_karel')
          .click(function(event) {
            wRender.primera_fila = mundo.i;
            wRender.primera_columna = mundo.j;
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
          });

      $('#posicion_karel')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_POSITION);
            $('#xmlMundo').html(mundo.save());
          });

      $('#orientacion_karel')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_ORIENTATION);
            $('#xmlMundo').html(mundo.save());
          });

      $('#mochila_karel')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_BAG);
            $('#xmlMundo').html(mundo.save());
          });

      $('#universo')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_ALL_BUZZERS);
            $('#xmlMundo').html(mundo.save());
          });

      $('#dump_avanza')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_MOVE);
            $('#xmlMundo').html(mundo.save());
          });

      $('#dump_gira_izquierda')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_LEFT);
            $('#xmlMundo').html(mundo.save());
          });

      $('#dump_coge_zumbador')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_PICK_BUZZER);
            $('#xmlMundo').html(mundo.save());
          });

      $('#dump_deja_zumbador')
          .click(function(event) {
            mundo.toggleDumps(World.DUMP_LEAVE_BUZZER);
            $('#xmlMundo').html(mundo.save());
          });

      $('#ctx_norte')
          .click(function(event) {
            mundo.move(fila_evento, columna_evento);
            mundo.rotate('NORTE');
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#ctx_sur')
          .click(function(event) {
            mundo.move(fila_evento, columna_evento);
            mundo.rotate('SUR');
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#ctx_este')
          .click(function(event) {
            mundo.move(fila_evento, columna_evento);
            mundo.rotate('ESTE');
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#ctx_oeste')
          .click(function(event) {
            mundo.move(fila_evento, columna_evento);
            mundo.rotate('OESTE');
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#n_zumbadores')
          .click(function(event) {
            modalPrompt('¿Cuántos zumbadores?', '0')
                .then(
                    function(response) {
                      mundo.setBuzzers(fila_evento, columna_evento, response);
                      $('#wcontext_menu').css('display', 'none');
                      wRender.paint(mundo, canvas.width, canvas.height,
                                    {editable: mundo_editable});
                      $('#xmlMundo').html(mundo.save());
                    },
                    function() { $('#wcontext_menu')
                                     .css('display', 'none'); });
          });

      $('#inf_zumbadores_ctx')
          .click(function(event) {
            mundo.setBuzzers(fila_evento, columna_evento, -1);
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#cero_zumbadores')
          .click(function(event) {
            mundo.setBuzzers(fila_evento, columna_evento, 0);
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#toggle_dump_cell')
          .click(function(event) {
            mundo.toggleDumpCell(fila_evento, columna_evento);
            $('#wcontext_menu').css('display', 'none');
            wRender.paint(mundo, canvas.width, canvas.height,
                          {editable: mundo_editable});
            $('#xmlMundo').html(mundo.save());
          });

      $('#importar')
          .submit(function(event) {
            var mdo = $('#importar_mdo')[0].files[0];
            var mdoReader = new FileReader();
            mdoReader.onload = (function(mdoReader) {
              return function(e) {
                var kec = $('#importar_kec')[0].files[0];
                var kecReader = new FileReader();
                kecReader.onload = (function(kecReader, mdo) {
                  return function(e) {
                    $('#worldclean').click();
                    mundo.import(new Uint16Array(mdo),
                                 new Uint16Array(kecReader.result));
                    wRender.paint(mundo, canvas.width, canvas.height,
                                  {editable: mundo_editable});
                    $('#xmlMundo').html(mundo.save());
                    $('#importar_modal').modal('hide');
                    if ($('#posicion_karel').hasClass('active') !=
                        mundo.getDumps(World.DUMP_POSITION)) {
                      $('#posicion_karel').button('toggle');
                    }
                    if ($('#orientacion_karel').hasClass('active') !=
                        mundo.getDumps(World.DUMP_ORIENTATION)) {
                      $('#orientacion_karel').button('toggle');
                    }
                    if ($('#mochila_karel').hasClass('active') !=
                        mundo.getDumps(World.DUMP_BAG)) {
                      $('#mochila_karel').button('toggle');
                    }
                    if ($('#universo').hasClass('active') !=
                        mundo.getDumps(World.DUMP_ALL_BUZZERS)) {
                      $('#universo').button('toggle');
                    }
                    if ($('#dump_avanza').hasClass('active') !=
                        mundo.getDumps(World.DUMP_MOVE)) {
                      $('#dump_avanza').button('toggle');
                    }
                    if ($('#dump_gira_izquierda').hasClass('active') !=
                        mundo.getDumps(World.DUMP_LEFT)) {
                      $('#dump_gira_izquierda').button('toggle');
                    }
                    if ($('#dump_coge_zumbador').hasClass('active') !=
                        mundo.getDumps(World.DUMP_PICK_BUZZER)) {
                      $('#dump_coge_zumbador').button('toggle');
                    }
                    if ($('#dump_deja_zumbador').hasClass('active') !=
                        mundo.getDumps(World.DUMP_LEAVE_BUZZER)) {
                      $('#dump_deja_zumbador').button('toggle');
                    }
                  };
                })(kecReader, mdoReader.result);
                kecReader.readAsArrayBuffer(kec);
              };
            })(mdoReader);
            mdoReader.readAsArrayBuffer(mdo);
            return false;
          });
});

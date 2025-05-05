# Chessbot Playground Web UI

**Chessbot Playground** is an interface developed to allow the graphical testing of chessbots including a server, API, web UI and illustrative bot.
This repository provides a graphical user interface running as a local website. Whilst it is independent, it has to be embedded and
served from the [Chessbot Playground Server](https://github.com/matetirpak/chessbot-playground-server). Instructions can be found there
and for simple usage no changes have to be applied to this source code. Nonetheless, if you want to make changes or compile your own
bot into the web UI directly, the following instructions will act as a guide.


---

### Compiling Own Bot

Whilst running bots as standalone programs has no limitations, compiling one into the web UI directly offers limited customization.
Sadly, the current version only allows changes to the illustrative [Chessbot Playground Bot](https://github.com/matetirpak/chessbot-playground-bot). Instructions to possible changes can be found there.

Every involved .c and .h file then has to be placed in wasm_src.
When referring to the illustrative bot, those are all files in bot/.

Once completed, the Makefile can be called to first clean up the default bot and then compile everything in wasm_src/:

```bash
make clean
make all
```

---

### Use Own Web UI For The Server

To serve your own web UI source code in the [Chessbot Playground Server](https://github.com/matetirpak/chessbot-playground-server) follow the instructions asking you to copy
your src/ directory into the servers respective web directory.

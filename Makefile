SRC_DIR := src/wasm_src

C_FILES := $(wildcard $(SRC_DIR)/*.c)

OUTPUT := src/bot.js
OTHER_OUTPUT := src/bot.wasm src/bot.worker.js


PTHREAD_FLAGS = -pthread -s PTHREAD_POOL_SIZE=navigator.hardwareConcurrency
EXPORTS = -s EXPORTED_FUNCTIONS='["_bot_compute_move", "_bot_make_move", "_bot_create_board", "_bot_string_to_move", "_bot_print_board"]'
RUNTIME = -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]'
MEMORY = -s INITIAL_MEMORY=2147483648

$(OUTPUT): $(C_FILES)
	emcc $^ -O3 -flto -o $@ \
		$(PTHREAD_FLAGS) \
		$(EXPORTS) \
		$(RUNTIME) \
		$(MEMORY)
		
all: $(OUTPUT)

clean:
	rm -f $(OUTPUT) $(OTHER_OUTPUT)

.PHONY: all clean

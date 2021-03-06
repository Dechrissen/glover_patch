#ifndef __MEMWATCH_H__
#define __MEMWATCH_H__

#include "utility.h"
#include "memory.h"
#include "keyboard.h"

#define MIN_RAM 0x80000000
#define MAX_RAM 0x80800000
#define WORDS_PER_PAGE 16
#define BYTES_PER_LINE 4
#define MEMWATCH_POLLING_RATE 1 // every N frames

typedef enum watch_type {
    NO_WATCH,
    BYTE_WATCH,
    HWORD_WATCH,
    WORD_WATCH,
    FLOAT_WATCH
} watch_type;

#define MAX_WATCH 10

typedef struct watch_addr {
    void *paddr;
    watch_type type;
    char name[33];
    BOOLEAN enabled;
    BOOLEAN sign;
    BOOLEAN lock; // if true value will be locked (overwritten once a frame)
    u32 value; // locked value
} watch_addr;



typedef struct memwatch {
    //  7th bit == 1 -> Viewer enable flag
    //  6th bit == 1 -> Watch select flag (overrides viewer enable)
    //  5th bit == 1 -> ascii mode
    BYTE_T flags; // this really only needs to be 1 byte, but it is word for padding
    BYTE_T frame_counter; // used for polling rate
    HWORD_T cursor_pos; // cursor position, if FFFF it will select the address value
    WORD_T offset;
    BYTE_T *pstr; // string buffer, should have at least 18 bytes
    WORD_T base_addr; // start address of ram
    // WORD_T *watch_addr; // memory watch address if NULL ignore
    // watch_type watch_type;

    BYTE_T *pinput_addr; // for input request

    watch_addr watch_addrs[MAX_WATCH];
    u32 watch_index; // current index in permanent watches loops at MAX_WATCH
} memwatch;

extern memwatch pmemwatch;

void init_memwatch(memwatch *);

/**
 * Renders one specific address at all times
 * Polled every frame
 */
void render_watch_addr(memwatch *);

/**
 * Renders watch select menu
 */
void render_watchaddr(memwatch *);
void render_memwatch(memwatch *);

void prepware_watchaddr(memwatch *);

void prepare_watchselect(memwatch *);

/**
 * Prepares memwatch for rendering
 */
void prepare_memwatch(memwatch *);

void update_memwatch(memwatch *);

void watchselect_input_request(keyboard *, void *);
void address_input_request(keyboard *, void *);
void memwatch_input_request(keyboard *, void *);

void clear_all_watch(memwatch *);

#define memwatch_current_addr(pmw) (BYTE_T*)pmw->base_addr+(pmw->offset*WORDS_PER_PAGE*sizeof(WORD_T))

#endif

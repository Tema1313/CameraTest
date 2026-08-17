import { DISPLAY_SIZE, Y_MIN_VISIBLE, VISIBLE_HEIGHT_RATIO } from "../const";

export const toDisplayCoords = (nx: number, ny: number) => {
    const dx = nx * DISPLAY_SIZE;
    const dy = ((ny - Y_MIN_VISIBLE) / VISIBLE_HEIGHT_RATIO) * DISPLAY_SIZE;
    return { dx, dy };
};
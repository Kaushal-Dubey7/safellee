export const vibrateDeviation = () => {
  if (navigator.vibrate) navigator.vibrate([200, 50, 200]);
};

export const vibrateCheckin = () => {
  if (navigator.vibrate) navigator.vibrate([500, 100, 500, 100, 500]);
};

export const vibrateSOS = () => {
  if (navigator.vibrate) navigator.vibrate([1000, 200, 1000, 200, 1000, 200, 1000]);
};

export const vibrateLight = () => {
  if (navigator.vibrate) navigator.vibrate([100]);
};

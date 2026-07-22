// Book genre palette — shared by the timeline canvas and the legend
export const GENRE_COLORS = {
  Law:      '#8B2020',  // deep burgundy
  History:  '#1E4080',  // navy
  Wisdom:   '#8B6418',  // dark amber
  Poetry:   '#4A2480',  // deep indigo
  Prophecy: '#1A5C3A',  // pine green
  Gospel:   '#1A6B35',  // forest green
  Epistle:  '#3A1F70',  // deep violet
};

// Figure (people) bar palette by group — shared by the timeline canvas and the legend.
// Prophets/apostles are lighter tints of their genre hue (Prophecy pine / Gospel
// forest) to visually link author groups to their books; the OT-era groups keep
// distinct period colors since they have no 1:1 genre counterpart.
export const GROUP_COLOR = {
  patriarchs: '#c9a84c',
  exodus:     '#c0714e',  // terracotta — Moses & Aaron
  judges:     '#9a7ec8',
  kings:      '#c4a06b',
  prophets:   '#488B68',  // tint of Prophecy #1A5C3A
  apostles:   '#58AB62',  // tint of Gospel #1A6B35
};

(() => {
  "use strict";

  if (window.__SIMON_THOUGHT_LANGUAGE_V56__) return;
  window.__SIMON_THOUGHT_LANGUAGE_V56__ = true;

  const VERSION = 56;

  const TRANSLATIONS = new Map([
    // Orell / cashier story.
    ["Wow… die war aber wirklich süss.", "Wow… die isch aber würkli süess gsi."],
    ["Ich hätte irgendwas sagen sollen.", "Ich hätt öppis söue säge."],
    [
      "Ich sollte mir diesmal wirklich überlegen, wie ich sie anspreche.",
      "Ich sött mer würkli überlege, wie ich sie aaspriche."
    ],
    ["Nicht einfach irgendwas.", "Nöd eifach irgendöppis."],
    ["Ich brauche einen tiefgründigen Gedanken.", "Ich bruch en tüüfgründige Gedanke."],
    [
      "Vielleicht brauche ich dafür etwas mehr…",
      "Villicht bruch ich defür eifach chli meh…"
    ],
    ["WEITSICHT.", "WIITSICHT."],

    ["Nicht einfach irgendwas sagen.", "Nöd eifach irgendöppis säge."],
    ["Es sollte ehrlich sein.", "Es sött ehrlich sii."],
    ["Aber nicht oberflächlich.", "Aber nöd oberflächlich."],
    ["Selbstbewusst. Aber nicht arrogant.", "Selbstbewusst. Aber nöd arrogant."],
    ["Persönlich. Aber nicht komisch.", "Persönlich. Aber nöd komisch."],
    ["Vielleicht ein bisschen poetisch…", "Villicht es bitz poetisch…"],
    ["Ich hab’s.", "Ich ha's."],
    [
      "Dafür bin ich extra auf einen Berg gefahren.",
      "Defür bin ich extra uf en Berg gfahre."
    ],

    // Current Esthi shoe gate.
    [
      "Ich sollte erstmal nach den Schuhen schauen.",
      "Ich sött zerscht mal nach de Schueh luege."
    ],
    ["Erst die Schuhe.", "Zerscht d’Schueh."]
  ]);

  function translate(value) {
    if (typeof value !== "string") return value;
    return TRANSLATIONS.get(value) || value;
  }

  function patchPrototype(SceneClass) {
    const proto = SceneClass?.prototype;
    if (!proto || typeof proto.createSpeechBubble !== "function") return;

    const current = proto.createSpeechBubble;
    if (current.__thoughtLanguageV56) return;

    const wrapped = function createSpeechBubbleSwissThoughtV56(
      x,
      y,
      text,
      ...rest
    ) {
      return current.call(
        this,
        x,
        y,
        translate(text),
        ...rest
      );
    };

    wrapped.__thoughtLanguageV56 = true;
    proto.createSpeechBubble = wrapped;
  }

  function install() {
    const classes = window.__SIMON_SCENE_CLASSES__;

    patchPrototype(classes?.MilchbuckScene);
    patchPrototype(classes?.BahnhofquaiScene);
  }

  install();

  // Some wrappers replace scene methods later. Re-assert very cheaply.
  window.setInterval(install, 1000);

  window.SimonThoughtLanguageV56 = Object.freeze({
    VERSION,
    translate,
    install
  });

  console.info(
    "Thought Language v56: Simons bekannte Denkblasen werden auf Schweizerdeutsch dargestellt."
  );
})();

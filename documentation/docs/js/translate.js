function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,fr,es,ru,zh-CN,ar',
      layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: true,
      multilanguagePage: false,
    },
    "google_translate_element"
  );
}

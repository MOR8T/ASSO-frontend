/**
 * Типы для страницы продукта (проекта) архитектурной компании.
 * Структура ответа API: фиксированные секции (hero, описание, характеристики)
 * и массив динамических блоков с возможностью менять порядок и повторять типы.
 *
 * Модальное окно галереи (ProjectGalleryModal): список фото для просмотра
 * собирается на фронте как [hero.image] + все image из блоков type "gallery"
 * (если hero.mediaType === "image", иначе только галереи). Только изображения, без текста.
 */

export type MediaImage = {
  url: string;
  alt?: string;
};

/** Первая часть страницы — всегда одна на все проекты */
export type ProjectHero = {
  /** "image" — показываем фото, "video" — видео по videoUrl (YouTube и др.) */
  mediaType: "image" | "video";
  /** Изображение для hero (обязательно при mediaType "image", при "video" — превью) */
  image: MediaImage;
  /** Ссылка на видео (YouTube и т.д.), используется при mediaType "video" */
  videoUrl?: string | null;
  /** Заголовок поверх медиа (напр. "СОФТ МИНИМАЛИЗМ") */
  title: string;
  /** Подпись/локация (напр. "ТАДЖИКИСТАН, ДУШАНБЕ") */
  location: string;
};

/** Вторая часть — описание и характеристики, всегда одна */
export type ProjectDescriptionSection = {
  /** Текст описания (левая колонка), абзацы через \n\n или массив */
  description: string;
  /** Характеристики ключ–значение (правая колонка) */
  characteristics: Array<{ key: string; value: string }>;
};

/** Размер карточки в галерее */
export type GalleryCardSize = "1x1" | "2x1" | "1x2" | "2x2";

/** Блок: одна большая фотография */
export type BlockImage = {
  type: "image";
  id: string;
  data: {
    image: MediaImage;
  };
};

/** Блок: описание (только текст, без кнопок) */
export type BlockDescription = {
  type: "description";
  id: string;
  data: {
    content: string;
  };
};

/** Блок: CTA — единственное место с возможностью скачивания файла */
export type BlockCta = {
  type: "cta";
  id: string;
  data: {
    /** Текст кнопки (напр. "СКАЧАТЬ ФАЙЛ ДЛЯ ПРОСМОТРА ПРОЕКТ В 360") */
    text: string;
    /** URL файла для скачивания */
    downloadUrl: string;
    /** Имя файла при сохранении (опционально) */
    fileName?: string;
  };
};

/** Блок: галерея фотографий (карточки 1x1, 2x1, 1x2, 2x2) */
export type BlockGallery = {
  type: "gallery";
  id: string;
  data: {
    items: Array<{
      image: MediaImage;
      size: GalleryCardSize;
    }>;
  };
};

export type ProjectPageBlock =
  | BlockImage
  | BlockDescription
  | BlockCta
  | BlockGallery;

/** Полная структура продукта (проекта) из API */
export type ProjectPageResponse = {
  id: string;
  /** slug для URL, напр. [lang]/project/[id] */
  slug?: string;
  /** Первая часть — hero (медиа + текст) */
  hero: ProjectHero;
  /** Вторая часть — описание и характеристики */
  descriptionSection: ProjectDescriptionSection;
  /**
   * Динамические блоки: порядок и состав задаются запросом.
   * Каждый тип блока может встречаться несколько раз с разными данными.
   */
  blocks: ProjectPageBlock[];
};

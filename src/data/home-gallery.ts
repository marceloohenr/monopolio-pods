export interface HomeGalleryImage {
  id: string;
  src: string;
  alt: string;
  label: string;
}

const HOME_GALLERY_IMAGE_COUNT = 73;
const FEEDBACK_ASSET_VERSION = "2026-04-05-2";
const FEEDBACK_ASSET_BASE = `${import.meta.env.BASE_URL}assets/feedbacks`;

export const homeGalleryImages: HomeGalleryImage[] = Array.from(
  { length: HOME_GALLERY_IMAGE_COUNT },
  (_, index) => {
    const imageNumber = String(index + 1).padStart(3, "0");
    const fileName = `feedback-${imageNumber}.jpg`;

    return {
      id: `feedback-${imageNumber}`,
      src: `${FEEDBACK_ASSET_BASE}/${fileName}?v=${FEEDBACK_ASSET_VERSION}`,
      alt: `Feedback ${index + 1} de clientes via WhatsApp`,
      label: fileName,
    };
  },
);

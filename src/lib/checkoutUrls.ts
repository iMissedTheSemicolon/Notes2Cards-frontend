export const CHECKOUT_URLS = {
  T1: {
    monthly:  'https://notes2cards.lemonsqueezy.com/checkout/buy/0437a1b7-1bde-4765-b013-38e1439c0654?discount=0',
    yearly:   'https://notes2cards.lemonsqueezy.com/checkout/buy/797890a4-4c38-440c-9ea7-d14c89d4fcb3?discount=0',
    lifetime: 'https://notes2cards.lemonsqueezy.com/checkout/buy/ad5aa7ff-40b0-4466-843d-082b4147c051?discount=0',
  },
  T2: {
    monthly:  'https://notes2cards.lemonsqueezy.com/checkout/buy/1bd92f0c-8b67-4e0d-a22d-98b2d82e49e9?discount=0',
    yearly:   'https://notes2cards.lemonsqueezy.com/checkout/buy/91b42db8-1cdd-45a8-aa27-693ac7431a86?discount=0',
    lifetime: 'https://notes2cards.lemonsqueezy.com/checkout/buy/c4234f8d-5353-4e43-bc15-f2addc362fe3?discount=0',
  },
  T3: {
    monthly:  'https://notes2cards.lemonsqueezy.com/checkout/buy/57311df6-44f0-4527-8a74-7ed45cc34513?discount=0',
    yearly:   'https://notes2cards.lemonsqueezy.com/checkout/buy/e7039ecc-7b0f-4805-bd93-cad1d907a30a?discount=0',
    lifetime: 'https://notes2cards.lemonsqueezy.com/checkout/buy/3d493839-f31d-4322-953e-5105ec2358c5?discount=0',
  },
  T4: {
    monthly:  'https://notes2cards.lemonsqueezy.com/checkout/buy/5d139c42-8f36-480e-9407-bde0cdf32590?discount=0',
    yearly:   'https://notes2cards.lemonsqueezy.com/checkout/buy/25837db0-10f1-432d-92be-c8ab4a6415e6?discount=0',
    // No lifetime for T4
  },
} as const;

export type CheckoutTier = keyof typeof CHECKOUT_URLS;

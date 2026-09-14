/**
 * The album photography pool (DESIGN.md §12.6).
 * Generated from scripts/albums/photos.manifest.json — edit that, then run
 * `node scripts/prepare-albums.mjs`.
 */

export type AlbumBucket = "portrait" | "square" | "wide" | "hero";

export type BucketSpec = {
  /** Intrinsic aspect the derivatives are cropped to, as [w, h]. */
  aspect: [number, number];
  /** Rendered widths available, in CSS pixels. */
  widths: number[];
};

export type AlbumPhoto = {
  slot: string;
  alt: string;
  /**
   * Inline 20px placeholder per crop, so nothing pops in mid-reveal. Keyed by
   * bucket because the same photograph is cropped differently depending on the
   * slot it lands in.
   */
  lqip: Partial<Record<AlbumBucket, string>>;
  credit: { author: string; url: string };
};

export const albumBuckets: Record<AlbumBucket, BucketSpec> = {
  portrait: { aspect: [2, 3], widths: [320, 480, 720, 960] },
  square: { aspect: [1, 1], widths: [300, 480, 760, 1120] },
  wide: { aspect: [1440, 1135], widths: [640, 1040, 1600, 2160] },
  hero: { aspect: [3, 2], widths: [800, 1280, 1920, 2560] },
};

export const albumPhotos = {
  hero: {
    slot: "hero",
    alt: "A bride and groom holding hands against a low sun",
    lqip: {
      hero: "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAABQBACdASoUAA0APu1iqU2ppaQiMAgBMB2JYwC7Ef/gPIWuwWhy837G1ysAAPJyVPkvZ/QylIfXxDn30HevXgnCZWPcmTO+QEv9h6xEeuNRj6+kkVVWMlcUpq2UeuBMtpBSpKnBcxDoAA==",
    },
    credit: { author: "Jaakko Perälä", url: "https://unsplash.com/photos/a-bride-and-groom-holding-hands-at-sunset-l_ecNnA4xp0" },
  },
  a01: {
    slot: "a01",
    alt: "A white bouquet hanging beside the dresses, before anyone is in them",
    lqip: {
      portrait: "data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAACQBQCdASoUAB4APu1kq0+ppSOiMBgIATAdiWcAxgQRY9bRJ9abxWpKQFYDx3J34Vo4oi69AAD+79W1O772mx1XPDnJgeC5sNuolsgji7KvRs2qJEC4FIbOOarSPr9qcvXLRphoTDOkYltOpHobdtZ1KKSyQSFJUR4qZLzkO6bb4+YUtTND4a8zJXgFJAaH0RA0CrvSW22165eAlyswmeHsQl4pAAAA",
      square: "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAADQBACdASoUABQAPu1mqk8ppaOiKA1RMB2JZwDN/BGWkzBH0rQ/UVgXmtevhPIkCAD+7emTMdV3VPRLLdkiSl0wosuTLb+wUh/1p7M5/FgqdlZR5fSdR7UUMpH8hSmFCeVWjPpSwCJi5eULR2uY+Rwf58MfZsiR6ijaqFTWdUw4VnAEZ3D92ex7EH0+G2SzIAA=",
      wide: "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAABQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JZwDG9CLBnsQtl0qSrErxuOCAAP7t6ZMx1XdU9Est2SJKXTCiy5Mtv7BSH/Wnszn8WCp2VlHl9J1HtRQykfyFKYUJ5RU+teXA189APoh3EHk5kzYQDBaSEiv9McvTIAA=",
    },
    credit: { author: "Katie Puzatova", url: "https://unsplash.com/photos/white-floral-bouquet-hangs-near-wedding-dresses-WpV5SLaeFmA" },
  },
  a02: {
    slot: "a02",
    alt: "Beaded lace across the back of the gown, in black and white",
    lqip: {
      portrait: "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAABwBQCdASoUAB4APu1sq1EppaOiqAqpMB2JaQAAImtN057a03S+Xqinp3GqVhvrNTEuiswQAP7SRyxu0yga/K0cZl1dwkBXvOj+Cu9R75vomwAPZzBXmgXlNyHOGDafzcZJoY5EnPDyvDTqWjY8UISnamFLjvgkxNHSJOq626hq02QyW0AwWzsRYJEeQitiJZ6aMlEA798J9bPDXf9KAAAA",
      square: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAADwBACdASoUABQAPu1wsFIppiSiqAgBMB2JaQAAIiEgtukj25UDofjqob6wmdziNhAA/tGrwfTvOgCi4D6TKzWaFTd446jPQIx49+oNgkSgDfbzlXeWmwuxUpVZgpu26EEkbx7q2ToUENdf+nfRYyKhhQumODxrw5LN04vFsESYIisgAAA=",
      wide: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAADwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JaQAAPZtDfKSx6SmOSplIAP7cs21klXg4aKJNgrRQM2o4gmjBK1XsLTpiK8s70K5bcISXFP97JWe2jEwtRc7Zzz29JfP4k3Au2hVpHFBd2OR53WpdyggAAAA=",
    },
    credit: { author: "Wedding Photography", url: "https://unsplash.com/photos/grayscale-photo-of-beaded-lace-gown-DTLT9ESXM9s" },
  },
  a03: {
    slot: "a03",
    alt: "The bride's hand, newly ringed, around a bouquet of white roses",
    lqip: {
      portrait: "data:image/webp;base64,UklGRh4BAABXRUJQVlA4IBIBAABQBgCdASoUAB4APu1iqE2ppaOiMAgBMB2JaACdMyMv/kYBKs+646bQGY++A/dCffNHui5eteBIynO4CAD+8OGc4HLzIvASkwBurKr5YNijHQ5zCbSsnPkcvDcNoTgz3mM4ZyqnyihmFDtMTQx6qONxIyiNgz/EkXjYAodDNmLEMqzRiHa1t5P4XN8oKg1Cl8P2hivyaQvAYgDEuul/JF/kjWYBmxfpqDAIRj6u9/Q1gs3vSfaNL2/d7xpxTT6+xCpX7+9Ilr+omFHl5ptuygM9JraCJokr+uBx1we8A4/Z5IjR32QVNDc+WnYjiI73bXA8CYSv+Yev0WgVPnz8EQ0cnsuVhNhWGnwBNk1JH4hWAAAA",
      square: "data:image/webp;base64,UklGRr4AAABXRUJQVlA4ILIAAAAwBQCdASoUABQAPu1ur1IppiQiqAgBMB2JYwCsAYwcV1BZLwGGugotoQWWk/fn4w4EAAD+8Nx6bjN2zXetkHu41rHv88X1oxmGV8+VW8CLLao3UZfsu8XbidLMVEl2dret5t1yr/qBoK6V3zIeUnFHg6H+UYaTqRZxeGVh+qpfHF3L2mjapLksDoWy2Ve6nfiL2zPYIPcmGSNvtlFDqaN1SJUVNpsb9dkp8aIQfKW4BcgA",
      wide: "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAADwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JQBYdsZPLW6dRWcEO1B44AP7w354xAfoL99A6fPNFUoCQLHvUf997TOo077b0b+CCCkkqWZ73bpVJcHBBDYT+t0eAdOE4TB38GEuhoXHK0RKfwIDy2i2shtmGbtP00yIP5V+05rplLXprFNxNo5gEedx8u4AA",
    },
    credit: { author: "nicola dowie", url: "https://unsplash.com/photos/brides-hand-with-wedding-ring-holding-white-rose-bouquet-AGwgTf7ma64" },
  },
  a04: {
    slot: "a04",
    alt: "The bride in a white floral dress, turned toward the window",
    lqip: {
      portrait: "data:image/webp;base64,UklGRtAAAABXRUJQVlA4IMQAAACwBQCdASoUAB4APu1qrlCppaQiqAqpMB2JYwCzgA6za2lVUsCf15JYy/tNIxwac9E0ko0X9eAA/vFwkjLXppOOS+ugdgNnFVuB8uyWGABhR/igW5ddQhQhx/dx3nwGEDsvOVeQTrDaTOfW34dVtAdleuhGp3OxT6i/02BVCQlc46D+9YMtagtatxYH77ngVqgUogp9yabzs6WkGik+soBG0P7pS6sQPbpzTivgR8utTVNrwWc5mLfjyqboamtPxr1/gAAA",
      square: "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAABwBQCdASoUABQAPu1oqU+ppaOiKA1RMB2JZQC3uA6za2lVUsCfx1JYy/tNwK8b2MzMwXwAAP7xcJIy16aTjkvroHYDZxVbgfLslhgAYUf4oFuXXUIUIcf3cd58BhA7LzlXkE6w2kzn2LM6rd0vKoWsU7R0nLKXcAr5BLqynqOwyrgVsWHdkZtpy2ndUBXVS4b9n+T02wlOEd2mXgA=",
      wide: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAABQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JQBYdg6Ta2lVUsCf15JYy/tLAAP7xcJIy16aTjkvroHYDZxVbgfLslhgAYUf4oFuXXUIUIcf3cd58BhA7LzlXkE6w2kzn1UHpT7sBTPozsyd3TDbgbaSgcyeEoUKbShyzo90c7Uh5rZOAAAA=",
    },
    credit: { author: "Phakphoom Srinorajan", url: "https://unsplash.com/photos/woman-in-white-floral-wedding-dress-Sd-u1RmqWHg" },
  },
  a05: {
    slot: "a05",
    alt: "The couple at the head of the aisle, the shore behind them",
    lqip: {
      portrait: "data:image/webp;base64,UklGRtwAAABXRUJQVlA4INAAAACQBQCdASoUAB4APu1ur1IppiQiqAgBMB2JZQDDcywTn55uRNK8jne0DyM/8mYV/CLeL1UgYAD++WxTk+jg8nX04kBTCq7359QriLFG0Xcl2wvu6t+OiDydF1zXhyT4yabitWSq9OiDfeqRfxFzJdfk4jZfQoNqwLGPw3GzHBLDywEHZddp5WgFRC2fjoKH7TdAhCvuQrnrNFhv7QnVXbnwcVqxD+HP9sj3bxVXoQLVmsmtYnOYv6cT5C0TnFOslOW6COk0JFxt1x+YrqEVYAAA",
      square: "data:image/webp;base64,UklGRs4AAABXRUJQVlA4IMIAAADwBACdASoUABQAPu1ur1IppiQiqAgBMB2JZQC3uywTnYOdYR9kxVYsOV9WH6c89zAA/utamEJWcO6g4z9PT/Trh/9UWzPPaO50329QjD3W7UTc+hRBVLc1RrnqK9G/utLcDzPdLkG2pzHnqwF3UZ4rZup7Yl/UMAR8HIvMj1aXB35sIO89osG+I/aHvNXXdBywHkmuuk6h7B2l9GC/ReHs00OGNHj78dBrT2edMSARdYfoum26O2UHTCWNwFCCZqYAAA==",
      wide: "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAABQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JYwCo+aglABH4NXKfTKuRtmwAAP7J6wT8wXVPYYOKdW4h8C3oyhAzsv3JowM7VC299Ia6XaIkiORBRmi/ZlN+hOkcr+D629ZOYdwLWSW+mbQFHPIO1wLC9F7yog6vz/m0pV+DyUvYYoSimZwaUqL9Aorz3e4nVxAAAA==",
    },
    credit: { author: "Getúlio Moraes", url: "https://unsplash.com/photos/newly-wed-couple-on-isle-getting-married-at-shore-jbtbin3u0Xw" },
  },
  a06: {
    slot: "a06",
    alt: "Both kneeling as the blessing is read over them",
    lqip: {
      portrait: "data:image/webp;base64,UklGRsIAAABXRUJQVlA4ILYAAADwBACdASoUAB4APu1iqU2ppaOiMAgBMB2JYgC06ywBO3mChyeRnzGJxc7CbQ9alKAA/UGxuqD4TBldeus24m6Aepzka+S2w0uRXN8wpkJq8kNg0Opl/BWxBXCajWI4CHY9wUZzmB62E6qOjLBIh4rcX3xbib7U/QDtXk4THeyIIA1kqTSfJRVJ0B9LFoqWRpGdOM1KHruvipIo9vP7zx7Zh0T8HDHTa/xQOfPQx9qAfbnotsAAAA==",
      square: "data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAADQBACdASoUABQAPu1urlIppiQiqAgBMB2JQBadAccEdLjTt1xRGXinCM7g+WeWKADx/htMJgTv4Ld0wdMsmPmrRfoUCV/rfnxnAqgnuyPdj1739DXZ6PqQVDVoEL3h6PhGzpbJ3pOSACEOWZDEPI8qwM2IJYz8yMX/kFebJwCAwVqp1+xHpyxuGK89R0LBpLe/RiAbVifpb9ITE0NXEyUAAAA=",
      wide: "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JaACw7B0+jKEIQNnOuGhQwADJJMepSVBrG2KCZYX+sNIOUdXEvxi2R3wDQ8gBv7Efpjozw1yE5k0IIteTg3Y+nZxN2HXRU2mwR2sYIQJ0NI2nLTppDvcWYHB4AA==",
    },
    credit: { author: "Josh Applegate", url: "https://unsplash.com/photos/groom-and-bride-kneeling-in-front-of-priest-raising-the-holy-sacrament-nKJzYDP10Zw" },
  },
  a07: {
    slot: "a07",
    alt: "The bride mid-ceremony, the guests watching from either side",
    lqip: {
      portrait: "data:image/webp;base64,UklGRv4AAABXRUJQVlA4IPIAAAAQBgCdASoUAB4APu1iqE2ppaOiMAgBMB2JQBXEb1m7IdKDZLKKQRu9Isljm5h44c8QxOa4NM57A4AAzb+mkJHHltfPwAk9MDJZ3L3jOr36dsHyzIoqlc9SGW/HK7ZElbIs5kvkoFywhidKdPs3WXRHf6U9SjJHB03+Gryz3SolyZpuk1g0MSOgezNmF9IYwNiene6x90EtDAvks0zmSMznIeP8PM8TTWv9yxlE+0nqZIC5dcqGadb3AlxoNA7zil/euls/1uj0AOnopmK0qGsmNmr39iHcFLvZCGI2esMIXY7WSG41AeBhKLm3iTbQ9qQAAA==",
      square: "data:image/webp;base64,UklGRtQAAABXRUJQVlA4IMgAAACQBQCdASoUABQAPu1ur1IppiQiqAgBMB2JYwDG9dwLhANBfACF0PUGmHok5wB5LQB/VdQoAAD2PY6hixvMFwxy1lG9TpObmLG92b+hnLTR24iU12Do6vMdjnm/gRBm22G+yAdy5ZOs9pdaHst6CYz2zBnQyp0zSRVgm8S6MWpTF6NqcZM7HUudXdIhzjzyIrrgaIxBB8YSoOOGywsNrDRyi/w8mUQf69pa5jZjT1vsq7PgyrYfcbi/1Qvxa+K8TSbOHfqMJY4AAA==",
      wide: "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAACQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JYwCdAdwLgYVBIKe4bY9z4ftdL4AA/VIbgEDS5knk5Bzh8IEByipGeBZlzYJGxjaF81mKlym68Yq6yzvftMwLfbAGLWaBSxMXDVlncdq0igrnME4IDCX7iTmHGu/iNSaftq/7EjEH9BroRZK0PTtAQXRiEslPlY7WMImpBH204AAA",
    },
    credit: { author: "Fotógrafo Samuel Cruz", url: "https://unsplash.com/photos/bride-at-outdoor-wedding-ceremony-with-guests-watching-guests-EDjnxxq_3uY" },
  },
  a08: {
    slot: "a08",
    alt: "The first kiss as a married couple, against an old brick wall",
    lqip: {
      portrait: "data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAQBQCdASoUAB4APu1opU2ppiMiMBgMATAdiWMAnQAvsJsR/Bjdesfkkxf7ZyivCfSMAP38Y+owDpCklv+lEjTMjVbc3vws5LVYnLVJ+3L56MjbkG73yGxagyNhg9pBk+/+lkeR+z8cdHYgvdNiOw5emE/DR5CW6Gh/gJ8dtHljVlaP+go+EuOog5AF2+KO1vZVzZru5//Itqwy0t/39+s53SFH8pvx/b2h2NJtD6gAAA==",
      square: "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAADQBACdASoUABQAPu1srVIppaQiqAgBMB2JYwCdMuiBNzhJDo74GNGKkXpwBkt5gAD99xJwdwTr1g1nNNlWCrTVCAeGtOOnJbNzZ6IHKKVg3saLD+AlNZ/R/4utcUc4JBhEEvLBaAMd8iFcj5LvdhGte64Ez7s+Ok0V1ZwxppvUSCu0BsOo+f24+ioCYpoFZTgxjo/8Skc3gAAA",
      wide: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAADwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JQBOmUABNAVOIrE5TDbVgAP33EnB3BOvVJX7CBciYE5RJ2gWxma+/7u6Z3oSgcBjGP/BGqQwpmhKSY5uKVyVGaLrEmGCHp2QJrL89uMRTQXhde7XPbDSJXowwNybg8VppOXNSzpCQMKN4QAA=",
    },
    credit: { author: "Kari Bjorn Photography", url: "https://unsplash.com/photos/a-bride-and-groom-kissing-in-front-of-a-brick-building-LZFAhqVLUbM" },
  },
  a09: {
    slot: "a09",
    alt: "Two of the party peering round a corner to watch",
    lqip: {
      portrait: "data:image/webp;base64,UklGRsAAAABXRUJQVlA4ILQAAAAQBQCdASoUAB4APu1orVCppaQiqAqpMB2JQBdmbIAsiE8E2LuWlyEVNRxcwZ1F4swAAP6zLtWE42rXcobm93cfX7YGjgbvndwpZ9V40Z+MUbOFYLp1Cqw+iwhmNtxRFv4hB0RgcyHLkUBY8yuAeaMHljHjBm5bHg6Ve7fx2jWJfZKQsWQDOYhcUZIcohvUJuWs+kPJU5xu0if2Tp8fmHMV1RmDyHk3bOM6zV1G72DzjDUAAAA=",
      square: "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADQBACdASoUABQAPu1oqU+ppaOiKA1RMB2JYwDCgA5GS0eYy4loVPlgZF8L1iCagAD+sy7VhONq13KG5vd3H1+2Bo4G753cKWfVeNGfjFGzhWC6dQqsPosIZjbcURckooLoxFn6dFNOHdSoITlqt4o/zbldN4vM6IDgF5ir6JeUAVj9hmg/qCn6ZWTLifxcmvQqga3tAAAAAA==",
      wide: "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JQBOmUABYkJ4JsZfBf0DAAP6zLtWE42rXcobm93cfX7YGjgbvndwpZ9V40Z+MUbOFYLp1Cqw+iwhmNtxRFfvFtGzly7QRThAio/xrfhBHjeMSnJ/TLFSo/OMwsGk2MOkbgAAA",
    },
    credit: { author: "Jennifer Kalenberg", url: "https://unsplash.com/photos/two-women-peeking-around-a-corner-wBuxC31Ljh0" },
  },
  a10: {
    slot: "a10",
    alt: "The couple together, the bouquet held between them",
    lqip: {
      portrait: "data:image/webp;base64,UklGRvYAAABXRUJQVlA4IOoAAADwBQCdASoUAB4APu1kq1AppSOisBgIATAdiWIAv2rfTgG1PIeUWbokqPbX3PX9ROQMwZGN59cewAD+7qMJVh3iFUGXV13KqfvWcqFcGcKWVJI5RwvOXYfSjHNicj8Ld6Xdy4jtswlSw+MqdYmXwReHBLA+tcxL5DHs8cMRyljpWpx+VaClz9VV56Wv8Frdavg8zNRPWJRtbcnSuNxcnsIfr8Oq+QeqdsK3++76ftJfnDc+Kux05lNhgyWHhTpiV1Ip1rG2q2TgkOwajDqo7fMUT4U/R14he38393KKHolcrbPcVu5TxMAAAAA=",
      square: "data:image/webp;base64,UklGRsIAAABXRUJQVlA4ILYAAADwBACdASoUABQAPu1usFIppiSiqAgBMB2JYwDI1ArJqmVbvmcmrC2bHMYvehGPFOAA/uQz6aVVXWJBXqFlLzBBssM5lOZlDtD8Qf+6M3ZwQsgf/8P89LlBV14PJtufOiVgxUU2ErofeM3jw0IkujONXkDzX6ANl7wufKINTah6wQI2/G2c+iyTXgCzvAOCR+V/nLdN0kFnx6GGnvL7/6SxYRrUYVPljw+bE3G/HH4RLhkYdgAAAA==",
      wide: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAwBACdASoUABAAPu1iqU2ppaOiMAgBMB2JQBWABA2Z5sWG3o5Akwoc7gAA/roDmLYEbay16CEWitRYw3Z1IRnQKiYP2BJinQApHikuxYjohrgJiTmMl+GukQIdKcuJ9FQqBlRTEZnGy+rj2flix5idA81asR/Bq2YNYk6IiilR6FsqwAA=",
    },
    credit: { author: "Ashley Smith", url: "https://unsplash.com/photos/a-bride-and-groom-holding-a-bouquet-of-flowers-c5x1K9sug8c" },
  },
  a11: {
    slot: "a11",
    alt: "Two rings set down on white cloth",
    lqip: {
      portrait: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAABwBACdASoUAB4APu1gqk2ppaQiMBgMATAdiWcAAI90/pGXK8+zFKR69LZEAAD+9ggHVhOzLnVPH4ymjCSX/Y/w5ETr8OkRFpr9bkYEwacTVnmArEAAAA==",
      square: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQBACdASoUABQAPu1urlIppiQiqAgBMB2JaQAALnRcJQQYqSYybJ9cAAD+78dSupPyktVd+8msUISqTOdLu5CaeoAAAA==",
      wide: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADQAgCdASoUABAAPu1iqU2ppaOpMAgBMB2JaQAAfj4AAP7wEdp13mO9IgS/XMEZvY8IQeIhUAA=",
    },
    credit: { author: "Alexis Antoine", url: "https://unsplash.com/photos/two-wedding-rings-sitting-on-top-of-a-white-cloth-r7JZGKGhrf0" },
  },
  a12: {
    slot: "a12",
    alt: "Guests caught mid-feeling during the ceremony",
    lqip: {
      portrait: "data:image/webp;base64,UklGRswAAABXRUJQVlA4IMAAAADwBACdASoUAB4APu1oqU8ppiOiMBgIATAdiUAYG4aNnvdGAEYusW+Hzpm0kKZ9wAAA/vNwB9GKXInUghX7eT8MQAT3chBVRxhuCiVPA8y3SDkmEsA6HNb/uSxO6dRhl1Ef6ePeDv32KYxcModgfmw+QO+jBewjFPPc7nh/kflO6Cngoa2u+nwp+slcQ9Wf3t+VCDOMlEW0nAGrs3FtmpFesEJosgGMUxm/JtrYd9kVnf7NXrgiYrSQXdXdD34gAAA=",
      square: "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADwBACdASoUABQAPu1ur1KppiQiqAgBMB2JYwCBBARb6e3Mwsp2WyUsxbI18nFtTgAA/u+79HYY6TNFY09Hm4d+HwHwjGcpeCW1Q4tDuMdIDJjxU5mGsKKtrYncAs5MYJgPWsw/FvmxCbks7qhSJPq+1chiKLSO3DHzQemc6v2BXHUxdJ/YFRppJHfC1UaHcW9geAsxgVE5Gl2sfx3JZQlg1YYAAA==",
      wide: "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAADwAwCdASoUABAAPu1iqU2ppaQiMAgBMB2JYwC7ACHSmfHks3xn3dnoAP7vuvxuvzScbJNdk+zRLA/u8G67BJX8t2V7vTG5pVK+N73x4YPY8a9kRhGRMmpDAv18OEt6BqPam/PDLqRjawjzGsMCPXFPAcHZ8E0QAAA=",
    },
    credit: { author: "Alexander Mass", url: "https://unsplash.com/photos/guests-look-emotional-during-a-wedding-ceremony-4fRBQVPtaeg" },
  },
  a13: {
    slot: "a13",
    alt: "The room applauding, in black and white",
    lqip: {
      portrait: "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAADQBACdASoUAB4APu1qqVAppiOiqA1RMB2JaQAALbfSMyIuuz/+ZWYK5nHsyv9ngAD+8smqBkbCAea3aiPxpdzds2HFkCPZS98gJuprZPUKJH4dcgM5QABnFicABIVN4EBL8p/rcin8DqagA5j6gAAA",
      square: "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAADwBACdASoUABQAPu1srlIppaQiqAgBMB2JaQAALrbO0EM/TvddO2+698dAx5SlVwAA/vLJrYcdpsJNkmIq9mlbJec8HBpdUwqEsCFcC3beO2ZyVv9tGM4iYGI2wc8n8e6jluRHeDYZeq3MZGRAAAAA",
      wide: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoUABAAPu1iqU2ppaQiMAgBMB2JaQAAXG2doIaaI0t7IAD+8smthx2mwk2SYir2aVsl5zwcGl1TCoSwIVwLu5MEaHN92diXQmrg6b1l9+i3AAAA",
    },
    credit: { author: "sina rezakhani", url: "https://unsplash.com/photos/a-black-and-white-photo-of-a-group-of-people-clapping-qDvvd7G60qw" },
  },
  a14: {
    slot: "a14",
    alt: "The bridal party gathered together after the service",
    lqip: {
      portrait: "data:image/webp;base64,UklGRvoAAABXRUJQVlA4IO4AAACwBQCdASoUAB4APu1qq08ppiOiMBgIATAdiUAXZmHUugF7yjZQq7MA9nOK3pQf8OJ1jvL+SoAAzfCl5s139C51QoKwHJ55qXkUrMrvyhvzZPAbF+0rqmdl/EJObl/Lcl3nGt9bF1Qm0x/Eb9LMJCJoekhmIODJY9ChPM3tseaZ7LO0QJno2Ow+VlK0EYcj+1cGnK7NgTErWCOFihs2xCtQYYukV6Dg7QQmSGk7IUorVE8EMiOENQOotNmY91H7O4kiv6X7Sba7hfc1aqcEE/yOccuHLXV81aSGRfQHaE5SrdBegOejDZoRjGT4ogAA",
      square: "data:image/webp;base64,UklGRsoAAABXRUJQVlA4IL4AAAAwBQCdASoUABQAPu1ur1IppiQiqAgBMB2JQBYebwDZti2h7EyD7Uc+mGlCUpa4R0GOUAD+wiqkuewo1tqKV+DSbWSRDSck7Nme16WsZjVZTy9oSrRrZNdEyBrfIK5tfBsaRRMg80YE5VNQH2m/ZGGkUwEteOY3F/xa4gTyKu9MD4w1uvoFGkugqg3GUKRJZ8hOV7La6u+qC9xQvFnrm42vtBVBtvpnbhN3k5K3idkKzDOpVL3HLPqXOOh+gAAA",
      wide: "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAAAwBACdASoUABAAPu1iqU2ppaOiMAgBMB2JZAAD5Yov9GZmxkDzH5uh44AA/rxOiBLJvKho62dRevljuBx75B5TvY5MJvSka9AIZmSw+EteVu3A+dfBwda/EuyFTb4I9qR6/VohXQY8sVLx3Eb89clKONWGuQJRdz5M13HtvL66n8d6iUrLuCACx7swNkdjhGujz+QA",
    },
    credit: { author: "Ellie Cooper", url: "https://unsplash.com/photos/a-group-of-women-standing-next-to-each-other-tr6UAFrFnHM" },
  },
  a15: {
    slot: "a15",
    alt: "Four guests talking outside once the light had gone",
    lqip: {
      portrait: "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAADQBACdASoUAB4APu1kqk2ppaQiMAgBMB2JaQAD5aIN98niusP7TNzTKDJthm0YAAD+9BrNMvxzPOLxVBff60i3K7u08Yx7pZGqv4o+TfgZDOVZsLJ4LatmBqAFLRmxDpD+VFQezBFqQEkoPPe9r1OhbZwfC54g1CfgMBvqGgvj/bKijvAtrGx7Uuq5x4P7sL5vhxgjDSYuvDvP4wLnPAAA",
      square: "data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAAAQBQCdASoUABQAPu1oqU+ppaOiKA1RMB2JaQAD5dEJYFz1WFd/zmUVq0FlR0i5FhWAAP70JPBF5/OntHSwDx6fdZ0SCt3hiEPB17FAw+lnNXRTMXnsJKahUaIBvjHO6uGwVpmfxhPbjn6H7VSvRXJ3V6Z6dv8WaxUztEP6L1MRgJhfufkcDeZMNivB8yL+rLhdzfUAt8S8Lah0XWAAAA==",
      wide: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JaQAD5An+j9emeE13A4KlwAD+8zWXxddbbSsyLeThhyM/ZHIycnSGs2uejQ7B74ttITJ6jq18VrjuocIj3uaUCPGfwrXFTwZud9o/iR6JKqwkPPWdWiarGtRXhP3RBLMeSFRKhpMCni4gAAA=",
    },
    credit: { author: "Gylain Omer", url: "https://unsplash.com/photos/four-people-gathered-conversing-in-a-dark-outdoor-setting-cCfT8nOwF2c" },
  },
  a16: {
    slot: "a16",
    alt: "The hall laid for dinner, long tables running its whole length",
    lqip: {
      portrait: "data:image/webp;base64,UklGRuAAAABXRUJQVlA4INQAAACwBQCdASoUAB4APu1irVAppSQisBgIATAdiWMAsOwR9UWvGTKRYpvRXDHYfQ/21nYhbJAIWAAA/mYf8wJ3rtbuReTNcBpHmaJvlvWXt4XxcGNQodpnnsJMVC3YH9hh1f6L2PcRUioJv+6kkERWgzZqDu0xLjv4EW2AlrUigh1FtjRauXgDufuotexrX9uu2YQ5vWiStomjviKbow3ubLe/J5DnohdYPPb+PUxY3uAoKPxa5WqYQtVxjQeT2dmsAvL1YgI9sSgG8elDKVUHtGRHtgAAAA==",
      square: "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAAAQBQCdASoUABQAPu1oqVAppaOiqA1RMB2JZQDIn3gANR+dr+GC7hDV/BFW1ncgzoNAAPaq6o+1mkq6QCV5H+C9gvlGwEIEyGCvxuF3IELwP1rggaW7kO6U4YOBLpQDQ2yLzBUAMJnalAVAUj0Z8w/kKbtJyE4INFnfqbChDHjLUCKCoy2vEyEYspHTG8xiKAKhkKVAAAA=",
      wide: "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAADwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JZQC7ACPUm+zDLQ+CannQAPz4jNugMtKotjhEclaQKkAXBPjFMJncVH0qIF2nzvynMmJmeKMaw6khy1tjfOHWpv5JwdIipdXVceJvjMeHdtWyJtReqUzEgkDzK//arrJiVRQivVenUrgA",
    },
    credit: { author: "Adrien Olichon", url: "https://unsplash.com/photos/long-tables-set-for-a-banquet-in-a-grand-hall-jds_OTZ8c7w" },
  },
  a17: {
    slot: "a17",
    alt: "The two of them on a bench, looking at each other and nobody else",
    lqip: {
      portrait: "data:image/webp;base64,UklGRsQAAABXRUJQVlA4ILgAAABwBQCdASoUAB4APu1kqU2ppaQiMAgBMB2JZwDGRagBl1O++qaeKsjmwJWqNVhfoLiKs++gAP7uiKXPyvOFfpJTpIZMY/qckB93YAweFsfjfmmKyohZGvMztcY8NNacwU3PiQb/+1zQxcG+WtyKO78qQOzUFjKGsunqYOPQukxT8HMAVKlGgc+yaeDg6HVB0ymr2TzArQnFOULabQTfSkSg5R2l6U75dd8nl62vgbhGG/QdCGd+AAAA",
      square: "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAACQBACdASoUABQAPu1oqU+ppiOiKA1RMB2JZwDKtBEb6LVRb3xn54TzjpKJorAA/u6T0Ck4F3AI7A1Fk29Nbbo1rVeqxJ4kWikPMbXXscYS52QvJn9spPIak+Xiv4PhvZiI0ZB2pKbelRGbIIeFScWbhWauHehlmQtTIt34gi9/D9fL8EofDNakAAA=",
      wide: "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAACwAwCdASoUABAAPu1iqU2ppaOiMAgBMB2JZwAAYdO6tYMqppvoAAD+7E07psISTyht/u/p0RO9Z0ulGsz55YmW9lAkrf89VJSDfOdIq/lKogfqlFhaE76lXR0dvpoG0gbXwucm8zauWRKjBVup3HWJtrYcakQAAAA=",
    },
    credit: { author: "Negar Nikkhah", url: "https://unsplash.com/photos/elegant-couple-looking-at-each-other-on-a-park-bench-sZOVT5WKzf8" },
  },
  a18: {
    slot: "a18",
    alt: "The couple under the chandelier at the end of the night",
    lqip: {
      portrait: "data:image/webp;base64,UklGRgIBAABXRUJQVlA4IPYAAAAQBgCdASoUAB4APu1mqk2ppaQiMAgBMB2JYgCdMyG6gKqfTjmPQl48dgY0n+fcktAN8VYeMxeBG5AA/ujxVieiaTBKaRlFW0xB78cKPJvHhz2NpG+V31mteqT7D71TygXbsE7E7VIYGWU5o2As/n2QRaScTJI6fwHF4zFgAyHDXhokxSb9+AGCAXMjjvZ8jq3qyFpWlBiEEvhLC3yDL6pr7lN+HF1wdkfDWQGRAHrADWp9I8uw8+F1ebuDMWOq5kG5wqaGQsNhMFT0PeLrxPOZN9jcgl9oVygnjjkxCCBZgCP5/r5yYo6PsxbD+vGjCY5SMJiAAAA=",
      square: "data:image/webp;base64,UklGRswAAABXRUJQVlA4IMAAAAAwBQCdASoUABQAPu1ur1IppiQiqAgBMB2JQBOmYJ5oAK9iADnJr6VtBE9T6SGO70sU4AD+6PFWJ6VHQV6CK8+X32164jFuJMUzxFuHT7JT9bJ++CyIyazPGH6mU3d7NE7QRYLJgamozdgid68lmNdh6V4q59xKqrUoSdduyUlwTEJrHnuZrWehWDR77eV9Lv659k7wodBT2ClX831iVP1JLte19tgBds5eD+jFRHARUqgSWH/g13vX7lFhAVEJNAA=",
      wide: "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAAAQBACdASoUABAAPu1iqU2ppaOiMAgBMB2JZACdMoADKqfHV1lAWlKqUAD+40l1CGWSftj2FouZfWiocpUjTFS+lNAFG+TWQD6fIN05YhE/2fRfJdroDRimnHvbd/uuPMc+kwDASs0vgAUrYYK2ap/m7kvhldrEbfhtZdIKRRlRI2KB+eE4TUgiZgTAAA==",
    },
    credit: { author: "Jennifer Kalenberg", url: "https://unsplash.com/photos/a-bride-and-groom-standing-in-front-of-a-chandelier-SI3oKGfzMjk" },
  },
} as const satisfies Record<string, AlbumPhoto>;

export type AlbumPhotoId = keyof typeof albumPhotos;

/** Every gallery slot, in narrative order. The hero is addressed separately. */
export const galleryPhotoIds = [
  "a01",
  "a02",
  "a03",
  "a04",
  "a05",
  "a06",
  "a07",
  "a08",
  "a09",
  "a10",
  "a11",
  "a12",
  "a13",
  "a14",
  "a15",
  "a16",
  "a17",
  "a18",
] as const satisfies readonly AlbumPhotoId[];

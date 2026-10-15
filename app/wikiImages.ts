// Curated Wikipedia figures (image + caption) for earth.exe. Captions were
// pulled from the Wikipedia REST media-list API; blue segments are the
// caption's own links. Curated rather than fetched at random so a stray
// article can never put something graphic on the portfolio.
//
// To add one: open https://en.wikipedia.org/api/rest_v1/page/media-list/<Article>,
// copy a figure's thumbnail URL (use a standard width: 330px or 500px) and
// its caption, and add an entry below. Images are hotlinked from Wikimedia
// Commons and are all openly licensed.

export type CaptionPart = { text: string; href?: string };

export type WikiImage = {
  src: string;
  caption: CaptionPart[];
  article: string;
  articleUrl: string;
};

export const wikiImages: WikiImage[] = [
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg/330px-Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg",
    "caption": [
      {
        "text": "Styrofoam peanuts",
        "href": "https://en.wikipedia.org/wiki/Foam_peanut"
      },
      {
        "text": " stuck to a "
      },
      {
        "text": "cat",
        "href": "https://en.wikipedia.org/wiki/Cat"
      },
      {
        "text": "'s fur as a result of static cling."
      }
    ],
    "article": "Static cling",
    "articleUrl": "https://en.wikipedia.org/wiki/Static_cling"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/LED_nightlight_with_switch.JPG/500px-LED_nightlight_with_switch.JPG",
    "caption": [
      {
        "text": "An "
      },
      {
        "text": "LED",
        "href": "https://en.wikipedia.org/wiki/LED"
      },
      {
        "text": " nightlight"
      }
    ],
    "article": "Night light",
    "articleUrl": "https://en.wikipedia.org/wiki/Night_light"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Sea_of_water_balloons_by_Slaunger_2009-06-26.JPG/500px-Sea_of_water_balloons_by_Slaunger_2009-06-26.JPG",
    "caption": [
      {
        "text": "A variety of water balloons placed in water to prevent popping"
      }
    ],
    "article": "Water balloon",
    "articleUrl": "https://en.wikipedia.org/wiki/Water_balloon"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Apple_AudioVision_14_Display.png/500px-Apple_AudioVision_14_Display.png",
    "caption": [
      {
        "text": "A "
      },
      {
        "text": "cathode ray tube",
        "href": "https://en.wikipedia.org/wiki/Cathode_ray_tube"
      },
      {
        "text": " (CRT) computer monitor"
      }
    ],
    "article": "Computer monitor",
    "articleUrl": "https://en.wikipedia.org/wiki/Computer_monitor"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Drumset_IMG_1231-1_%282476620859%29_%28brighter%29.jpg/500px-Drumset_IMG_1231-1_%282476620859%29_%28brighter%29.jpg",
    "caption": [
      {
        "text": "A drum kit with a multi-cymbal configuration."
      }
    ],
    "article": "Drum kit",
    "articleUrl": "https://en.wikipedia.org/wiki/Drum_kit"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Traditional_Grip.jpg/500px-Traditional_Grip.jpg",
    "caption": [
      {
        "text": "A pair of drumsticks held in traditional grip."
      }
    ],
    "article": "Drum kit",
    "articleUrl": "https://en.wikipedia.org/wiki/Drum_kit"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Hi-hats.jpg/330px-Hi-hats.jpg",
    "caption": [
      {
        "text": "Hi-hats. The clutch suspends the top cymbal on a rod operated by a pedal."
      }
    ],
    "article": "Cymbal",
    "articleUrl": "https://en.wikipedia.org/wiki/Cymbal"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Il_pomodoro.jpg/500px-Il_pomodoro.jpg",
    "caption": [
      {
        "text": "A pomodoro kitchen timer"
      }
    ],
    "article": "Pomodoro Technique",
    "articleUrl": "https://en.wikipedia.org/wiki/Pomodoro_Technique"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Floppy_disk_2009_G1.jpg/500px-Floppy_disk_2009_G1.jpg",
    "caption": [
      {
        "text": "8-inch (200 mm), 5.25-inch (130 mm), and 3.5-inch (90 mm) floppy disks"
      }
    ],
    "article": "Floppy disk",
    "articleUrl": "https://en.wikipedia.org/wiki/Floppy_disk"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duck_assisting_with_debugging.jpg/330px-Rubber_duck_assisting_with_debugging.jpg",
    "caption": [
      {
        "text": "A "
      },
      {
        "text": "rubber duck",
        "href": "https://en.wikipedia.org/wiki/Rubber_duck"
      },
      {
        "text": " in use by a developer to aid debugging"
      }
    ],
    "article": "Rubber duck debugging",
    "articleUrl": "https://en.wikipedia.org/wiki/Rubber_duck_debugging"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/MTY4.jpg/500px-MTY4.jpg",
    "caption": [
      {
        "text": "Monterrey seen from a "
      },
      {
        "text": "Cerro de la Silla",
        "href": "https://en.wikipedia.org/wiki/Cerro_de_la_Silla"
      },
      {
        "text": " antenna. The mountain to the left in the background is "
      },
      {
        "text": "Cerro de las Mitras",
        "href": "https://en.wikipedia.org/wiki/Cerro_de_las_Mitras"
      },
      {
        "text": "; that on the right is "
      },
      {
        "text": "Cerro del Topo Chico",
        "href": "https://en.wikipedia.org/wiki/Cerro_del_Topo_Chico"
      },
      {
        "text": "."
      }
    ],
    "article": "Monterrey",
    "articleUrl": "https://en.wikipedia.org/wiki/Monterrey"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Styrofoam_packing_peanut_inner_structure.jpg/500px-Styrofoam_packing_peanut_inner_structure.jpg",
    "caption": [
      {
        "text": "The inner structure of a foam peanut, magnified 390× on a "
      },
      {
        "text": "SEM",
        "href": "https://en.wikipedia.org/wiki/Scanning_electron_microscope"
      }
    ],
    "article": "Packing peanuts",
    "articleUrl": "https://en.wikipedia.org/wiki/Packing_peanuts"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Parlplatta_%288457346%29.jpg/500px-Parlplatta_%288457346%29.jpg",
    "caption": [
      {
        "text": "Circular pattern created on a board of pegs arranged in concentric rings."
      }
    ],
    "article": "Perler beads",
    "articleUrl": "https://en.wikipedia.org/wiki/Perler_beads"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Cross-stitch_embroidery_on_black_background.jpg/500px-Cross-stitch_embroidery_on_black_background.jpg",
    "caption": [
      {
        "text": "Traditional cross-stitch embroidery"
      }
    ],
    "article": "Pixel art",
    "articleUrl": "https://en.wikipedia.org/wiki/Pixel_art"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Pegboard.jpg/500px-Pegboard.jpg",
    "caption": [
      {
        "text": "A close-up view of a sheet of pegboard"
      }
    ],
    "article": "Pegboard",
    "articleUrl": "https://en.wikipedia.org/wiki/Pegboard"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Virtual_Pets_at_Rupriikki_Media_Museum.JPG/500px-Virtual_Pets_at_Rupriikki_Media_Museum.JPG",
    "caption": [
      {
        "text": "Tamagotchis on display at the "
      },
      {
        "text": "Rupriikki Media Museum",
        "href": "https://en.wikipedia.org/wiki/Rupriikki_Media_Museum"
      },
      {
        "text": " in "
      },
      {
        "text": "Tampere",
        "href": "https://en.wikipedia.org/wiki/Tampere"
      },
      {
        "text": ", Finland"
      }
    ],
    "article": "Tamagotchi",
    "articleUrl": "https://en.wikipedia.org/wiki/Tamagotchi"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/SNES-Controller-in-Hand.jpg/500px-SNES-Controller-in-Hand.jpg",
    "caption": [
      {
        "text": "A North American "
      },
      {
        "text": "Super Nintendo Entertainment System",
        "href": "https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System"
      },
      {
        "text": " controller, following a conventional "
      },
      {
        "text": "gamepad",
        "href": "https://en.wikipedia.org/wiki/Gamepad"
      },
      {
        "text": " layout"
      }
    ],
    "article": "Game controller",
    "articleUrl": "https://en.wikipedia.org/wiki/Game_controller"
  },
  {
    "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Tomb_of_Nakht_%287%29.jpg/500px-Tomb_of_Nakht_%287%29.jpg",
    "caption": [
      {
        "text": "A cat eats a fish under a chair, in a "
      },
      {
        "text": "mural",
        "href": "https://en.wikipedia.org/wiki/Mural"
      },
      {
        "text": " in an Egyptian tomb dating to the 15th century BCE."
      }
    ],
    "article": "Cat",
    "articleUrl": "https://en.wikipedia.org/wiki/Cat"
  }
];

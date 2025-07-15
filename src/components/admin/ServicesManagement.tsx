// src/pages/ServicesManagement.jsx
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { httpFile } from "../../config.js";       // ← adjust if you actually did `export default httpFile`

import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Wand2, Edit, Trash2, Eye, Settings } from "lucide-react";

/**
 * A list of (100+) free FontAwesome “fas fa-…” icon names (omit the "fa-" prefix).
 * We’ll render each as <i className={`fas fa-${iconName}`}></i>.
 * You can extend or prune this array to match the exact icons you have locally.
 */
export const ALL_FAS_ICONS = [
  "ad",
  "address-book",
  "address-card",
  "adjust",
  "air-freshener",
  "align-center",
  "align-justify",
  "align-left",
  "align-right",
  "allergies",
  "ambulance",
  "american-sign-language-interpreting",
  "anchor",
  "angle-double-down",
  "angle-double-left",
  "angle-double-right",
  "angle-double-up",
  "angle-down",
  "angle-left",
  "angle-right",
  "angle-up",
  "angry",
  "ankh",
  "apple-alt",
  "archive",
  "archway",
  "arrow-alt-circle-down",
  "arrow-alt-circle-left",
  "arrow-alt-circle-right",
  "arrow-alt-circle-up",
  "arrow-circle-down",
  "arrow-circle-left",
  "arrow-circle-right",
  "arrow-circle-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrows-alt",
  "arrows-alt-h",
  "arrows-alt-v",
  "assistive-listening-systems",
  "asterisk",
  "at",
  "atlas",
  "atom",
  "audio-description",
  "award",
  "baby",
  "baby-carriage",
  "backspace",
  "backward",
  "bacon",
  "bahai",
  "balance-scale",
  "balance-scale-left",
  "balance-scale-right",
  "ban",
  "band-aid",
  "barcode",
  "bars",
  "baseball-ball",
  "basketball-ball",
  "bath",
  "battery-empty",
  "battery-full",
  "battery-half",
  "battery-quarter",
  "battery-three-quarters",
  "bed",
  "beer",
  "bell",
  "bell-slash",
  "bezier-curve",
  "bible",
  "bicycle",
  "biking",
  "binoculars",
  "biohazard",
  "birthday-cake",
  "blender",
  "blender-phone",
  "blind",
  "blog",
  "bold",
  "bolt",
  "bomb",
  "book",
  "book-dead",
  "book-medical",
  "book-open",
  "book-reader",
  "bookmark",
  "border-all",
  "border-none",
  "border-style",
  "bowling-ball",
  "box",
  "box-open",
  "box-tissue",
  "boxes",
  "braille",
  "brain",
  "bread-slice",
  "briefcase",
  "briefcase-medical",
  "broadcast-tower",
  "broom",
  "brush",
  "bug",
  "building",
  "bullhorn",
  "bullseye",
  "burn",
  "bus",
  "bus-alt",
  "business-time",
  "calculator",
  "calendar",
  "calendar-alt",
  "calendar-check",
  "calendar-day",
  "calendar-minus",
  "calendar-plus",
  "calendar-times",
  "calendar-week",
  "camera",
  "camera-retro",
  "campground",
  "candy-cane",
  "capsules",
  "car",
  "car-alt",
  "car-battery",
  "car-crash",
  "car-side",
  "caravan",
  "caret-down",
  "caret-left",
  "caret-right",
  "caret-square-down",
  "caret-square-left",
  "caret-square-right",
  "caret-square-up",
  "caret-up",
  "carrot",
  "cart-arrow-down",
  "cart-plus",
  "cash-register",
  "cat",
  "certificate",
  "chair",
  "chalkboard",
  "chalkboard-teacher",
  "charging-station",
  "chart-area",
  "chart-bar",
  "chart-line",
  "chart-pie",
  "check",
  "check-circle",
  "check-double",
  "check-square",
  "cheese",
  "chess",
  "chess-bishop",
  "chess-board",
  "chess-king",
  "chess-knight",
  "chess-pawn",
  "chess-queen",
  "chess-rook",
  "chevron-circle-down",
  "chevron-circle-left",
  "chevron-circle-right",
  "chevron-circle-up",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "child",
  "church",
  "circle",
  "circle-notch",
  "city",
  "clinic-medical",
  "clipboard",
  "clipboard-check",
  "clipboard-list",
  "clock",
  "clone",
  "closed-captioning",
  "cloud",
  "cloud-download-alt",
  "cloud-meatball",
  "cloud-moon",
  "cloud-moon-rain",
  "cloud-rain",
  "cloud-showers-heavy",
  "cloud-sun",
  "cloud-sun-rain",
  "cloud-upload-alt",
  "cocktail",
  "code",
  "code-branch",
  "coffee",
  "cog",
  "cogs",
  "coins",
  "columns",
  "comment",
  "comment-alt",
  "comment-dollar",
  "comment-dots",
  "comment-medical",
  "comment-slash",
  "comments",
  "comments-dollar",
  "compact-disc",
  "compass",
  "compress",
  "compress-alt",
  "compress-arrows-alt",
  "concierge-bell",
  "cookie",
  "cookie-bite",
  "copy",
  "copyright",
  "couch",
  "credit-card",
  "crop",
  "crop-alt",
  "cross",
  "crosshairs",
  "crow",
  "crown",
  "crutch",
  "cube",
  "cubes",
  "cut",
  "database",
  "deaf",
  "democrat",
  "desktop",
  "dharmachakra",
  "diagnoses",
  "dice",
  "dice-d20",
  "dice-d6",
  "dice-five",
  "dice-four",
  "dice-one",
  "dice-six",
  "dice-three",
  "dice-two",
  "digital-tachograph",
  "directions",
  "divide",
  "dizzy",
  "dna",
  "dog",
  "dollar-sign",
  "dolly",
  "dolly-flatbed",
  "donate",
  "door-closed",
  "door-open",
  "dot-circle",
  "dove",
  "download",
  "drafting-compass",
  "dragon",
  "dreamcatcher",
  "drum",
  "drum-steelpan",
  "drumstick-bite",
  "dumbbell",
  "dumpster",
  "dumpster-fire",
  "dungeon",
  "edit",
  "egg",
  "eject",
  "ellipsis-h",
  "ellipsis-v",
  "envelope",
  "envelope-open",
  "envelope-open-text",
  "envelope-square",
  "equals",
  "eraser",
  "ethernet",
  "euro-sign",
  "exchange-alt",
  "exclamation",
  "exclamation-circle",
  "exclamation-triangle",
  "expand",
  "expand-alt",
  "expand-arrows-alt",
  "external-link-alt",
  "external-link-square-alt",
  "eye",
  "eye-dropper",
  "eye-slash",
  "fan",
  "fast-backward",
  "fast-forward",
  "faucet",
  "fax",
  "feather",
  "feather-alt",
  "female",
  "fighter-jet",
  "file",
  "file-alt",
  "file-archive",
  "file-audio",
  "file-code",
  "file-contract",
  "file-csv",
  "file-download",
  "file-excel",
  "file-export",
  "file-image",
  "file-import",
  "file-invoice",
  "file-invoice-dollar",
  "file-medical",
  "file-medical-alt",
  "file-pdf",
  "file-powerpoint",
  "file-prescription",
  "file-signature",
  "file-upload",
  "file-video",
  "file-word",
  "fill",
  "fill-drip",
  "film",
  "filter",
  "fingerprint",
  "fire",
  "fire-alt",
  "fire-extinguisher",
  "first-aid",
  "fish",
  "fist-raised",
  "flag",
  "flag-checkered",
  "flag-usa",
  "flask",
  "flushed",
  "folder",
  "folder-minus",
  "folder-open",
  "folder-plus",
  "font",
  "football-ball",
  "forward",
  "frog",
  "frown",
  "frown-open",
  "funnel-dollar",
  "futbol",
  "gamepad",
  "gas-pump",
  "gavel",
  "gem",
  "genderless",
  "ghost",
  "gift",
  "gifts",
  "glass-cheers",
  "glass-martini",
  "glass-martini-alt",
  "glass-whiskey",
  "glasses",
  "globe",
  "globe-africa",
  "globe-americas",
  "globe-asia",
  "globe-europe",
  "golf-ball",
  "gopuram",
  "graduation-cap",
  "greater-than",
  "greater-than-equal",
  "grimace",
  "grin",
  "grin-alt",
  "grin-beam",
  "grin-beam-sweat",
  "grin-hearts",
  "grin-squint",
  "grin-squint-tears",
  "grin-stars",
  "grin-tears",
  "grin-tongue",
  "grin-tongue-squint",
  "grin-tongue-wink",
  "grin-wink",
  "grip-horizontal",
  "grip-lines",
  "grip-lines-vertical",
  "grip-vertical",
  "guitar",
  "h-square",
  "hamburger",
  "hammer",
  "hamsa",
  "hand-holding",
  "hand-holding-box",
  "hand-holding-heart",
  "hand-holding-medical",
  "hand-holding-usd",
  "hand-holding-water",
  "hand-lizard",
  "hand-middle-finger",
  "hand-paper",
  "hand-peace",
  "hand-point-down",
  "hand-point-left",
  "hand-point-right",
  "hand-point-up",
  "hand-pointer",
  "hand-rock",
  "hand-scissors",
  "hand-sparkles",
  "hand-spock",
  "hands",
  "hands-helping",
  "hands-wash",
  "handshake",
  "handshake-alt-slash",
  "handshake-slash",
  "hanukiah",
  "hard-hat",
  "hashtag",
  "hat-cowboy",
  "hat-cowboy-side",
  "hat-wizard",
  "hdd",
  "head-side-cough",
  "head-side-cough-slash",
  "head-side-mask",
  "head-side-virus",
  "heading",
  "headphones",
  "headset",
  "heart",
  "heart-broken",
  "heartbeat",
  "helicopter",
  "highlighter",
  "hiking",
  "hippo",
  "history",
  "hockey-puck",
  "holly-berry",
  "home",
  "horse",
  "horse-head",
  "hospital",
  "hospital-alt",
  "hospital-symbol",
  "hospital-user",
  "hot-tub",
  "hotdog",
  "hotel",
  "hourglass",
  "hourglass-end",
  "hourglass-half",
  "hourglass-start",
  "house-damage",
  "house-user",
  "hryvnia",
  "i-cursor",
  "ice-cream",
  "icicles",
  "icons",
  "iid-sign",
  "image",
  "images",
  "inbox",
  "indent",
  "industry",
  "infinity",
  "info-circle",
  "italic",
  "jedi",
  "joint",
  "journal-whills",
  "kaaba",
  "key",
  "keyboard",
  "khanda",
  "kiss",
  "kiss-beam",
  "kiss-wink-heart",
  "kiwi-bird",
  "landmark",
  "language",
  "laptop",
  "laptop-code",
  "laptop-medical",
  "laugh",
  "laugh-beam",
  "laugh-squint",
  "laugh-wink",
  "layer-group",
  "leaf",
  "lemon",
  "less-than",
  "less-than-equal",
  "level-down-alt",
  "level-up-alt",
  "life-ring",
  "lightbulb",
  "link",
  "lira-sign",
  "list",
  "list-alt",
  "list-ol",
  "list-ul",
  "location-arrow",
  "lock",
  "lock-open",
  "long-arrow-alt-down",
  "long-arrow-alt-left",
  "long-arrow-alt-right",
  "long-arrow-alt-up",
  "low-vision",
  "luggage-cart",
  "lungs",
  "lungs-virus",
  "magic",
  "magnet",
  "mail-bulk",
  "male",
  "map",
  "map-marked",
  "map-marked-alt",
  "map-marker",
  "map-marker-alt",
  "map-pin",
  "map-signs",
  "marker",
  "mars",
  "mars-double",
  "mars-stroke",
  "mars-stroke-h",
  "mars-stroke-v",
  "martini-glass",
  "martini-glass-citrus",
  "mask",
  "medal",
  "medkit",
  "meh",
  "meh-blank",
  "meh-rolling-eyes",
  "memory",
  "menorah",
  "mercury",
  "meteor",
  "microchip",
  "microphone",
  "microphone-alt",
  "microphone-alt-slash",
  "microphone-slash",
  "microscope",
  "minus",
  "minus-circle",
  "minus-square",
  "mitten",
  "mobile",
  "mobile-alt",
  "money-bill",
  "money-bill-alt",
  "money-bill-wave",
  "money-bill-wave-alt",
  "money-check",
  "money-check-alt",
  "monument",
  "moon",
  "mortar-pestle",
  "mosque",
  "motorcycle",
  "mountain",
  "mouse-pointer",
  "music",
  "network-wired",
  "neuter",
  "newspaper",
  "not-equal",
  "notes-medical",
  "object-group",
  "object-ungroup",
  "oil-can",
  "om",
  "otter",
  "outdent",
  "pager",
  "paint-brush",
  "paint-roller",
  "palette",
  "pallet",
  "paper-plane",
  "paperclip",
  "parachute-box",
  "paragraph",
  "parking",
  "passport",
  "pastafarianism",
  "paste",
  "pause",
  "pause-circle",
  "paw",
  "peace",
  "pen",
  "pen-alt",
  "pen-fancy",
  "pen-nib",
  "pen-square",
  "pencil-alt",
  "people-arrows",
  "percent",
  "percentage",
  "person-booth",
  "phone",
  "phone-alt",
  "phone-slash",
  "phone-square",
  "phone-square-alt",
  "phone-volume",
  "photo-video",
  "piggy-bank",
  "pills",
  "pizza-slice",
  "place-of-worship",
  "plane",
  "plane-arrival",
  "plane-departure",
  "play",
  "play-circle",
  "plug",
  "plus",
  "plus-circle",
  "plus-square",
  "podcast",
  "poll",
  "poll-h",
  "poo",
  "poo-storm",
  "poop",
  "portrait",
  "power-off",
  "pray",
  "praying-hands",
  "prescription",
  "prescription-bottle",
  "prescription-bottle-alt",
  "print",
  "procedures",
  "project-diagram",
  "pump-medical",
  "pump-soap",
  "puzzle-piece",
  "qrcode",
  "question",
  "question-circle",
  "quidditch",
  "quote-left",
  "quote-right",
  "quran",
  "radiation",
  "radiation-alt",
  "rainbow",
  "random",
  "receipt",
  "record-vinyl",
  "recycle",
  "redo",
  "redo-alt",
  "registered",
  "remove-format",
  "reply",
  "reply-all",
  "retweet",
  "ribbon",
  "road",
  "robot",
  "rocket",
  "route",
  "rss",
  "rss-square",
  "ruble-sign",
  "ruler",
  "ruler-combined",
  "ruler-horizontal",
  "ruler-vertical",
  "running",
  "rupee-sign",
  "sad-cry",
  "sad-tear",
  "satellite",
  "satellite-dish",
  "save",
  "school",
  "screwdriver",
  "scroll",
  "sd-card",
  "search",
  "search-dollar",
  "search-location",
  "search-minus",
  "search-plus",
  "seedling",
  "server",
  "shapes",
  "share",
  "share-alt",
  "share-alt-square",
  "share-square",
  "shekel-sign",
  "shield-alt",
  "shield-virus",
  "ship",
  "shipping-fast",
  "shoe-prints",
  "shopping-bag",
  "shopping-basket",
  "shopping-cart",
  "shower",
  "shuttle-van",
  "sign",
  "sign-in-alt",
  "sign-language",
  "sign-out-alt",
  "signal",
  "signature",
  "sim-card",
  "sitemap",
  "skating",
  "skiing",
  "skiing-nordic",
  "skull",
  "skull-crossbones",
  "slash",
  "sleigh",
  "sliders-h",
  "smile",
  "smile-beam",
  "smile-wink",
  "smog",
  "smoking",
  "smoking-ban",
  "sms",
  "snowboarding",
  "snowflake",
  "snowman",
  "snowplow",
  "sofa",
  "sort",
  "sort-alpha-down",
  "sort-alpha-down-alt",
  "sort-alpha-up",
  "sort-alpha-up-alt",
  "sort-amount-down",
  "sort-amount-down-alt",
  "sort-amount-up",
  "sort-amount-up-alt",
  "sort-down",
  "sort-numeric-down",
  "sort-numeric-down-alt",
  "sort-numeric-up",
  "sort-numeric-up-alt",
  "sort-up",
  "spa",
  "space-shuttle",
  "spell-check",
  "spider",
  "spinner",
  "splotch",
  "spray-can",
  "square",
  "square-full",
  "square-root-alt",
  "stamp",
  "star",
  "star-and-crescent",
  "star-half",
  "star-half-alt",
  "star-of-david",
  "star-of-life",
  "step-backward",
  "step-forward",
  "stethoscope",
  "sticky-note",
  "stop",
  "stop-circle",
  "stopwatch",
  "store",
  "store-alt",
  "store-alt-slash",
  "store-slash",
  "street-view",
  "strikethrough",
  "stroopwafel",
  "subscript",
  "subway",
  "suitcase",
  "suitcase-rolling",
  "sun",
  "superscript",
  "surprise",
  "swatchbook",
  "swimmer",
  "swimming-pool",
  "synagogue",
  "sync",
  "sync-alt",
  "syringe",
  "table",
  "table-tennis",
  "tablet",
  "tablet-alt",
  "tablets",
  "tachometer-alt",
  "tag",
  "tags",
  "tape",
  "tasks",
  "taxi",
  "teeth",
  "teeth-open",
  "temperature-high",
  "temperature-low",
  "tenge",
  "terminal",
  "text-height",
  "text-width",
  "th",
  "th-large",
  "th-list",
  "theater-masks",
  "thermometer",
  "thermometer-empty",
  "thermometer-full",
  "thermometer-half",
  "thermometer-quarter",
  "thermometer-three-quarters",
  "thumbs-down",
  "thumbs-up",
  "thumbtack",
  "ticket-alt",
  "times",
  "times-circle",
  "tint",
  "tint-slash",
  "tired",
  "toggle-off",
  "toggle-on",
  "toilet",
  "toilet-paper",
  "toolbox",
  "tools",
  "tooth",
  "torah",
  "torii-gate",
  "tractor",
  "trademark",
  "traffic-light",
  "train",
  "tram",
  "transgender",
  "transgender-alt",
  "trash",
  "trash-alt",
  "trash-restore",
  "trash-restore-alt",
  "tree",
  "trophy",
  "truck",
  "truck-loading",
  "truck-monster",
  "truck-moving",
  "truck-pickup",
  "tshirt",
  "tty",
  "tv",
  "umbrella",
  "umbrella-beach",
  "underline",
  "undo",
  "undo-alt",
  "universal-access",
  "university",
  "unlink",
  "unlock",
  "unlock-alt",
  "upload",
  "user",
  "user-alt",
  "user-alt-slash",
  "user-astronaut",
  "user-check",
  "user-circle",
  "user-clock",
  "user-cog",
  "user-edit",
  "user-friends",
  "user-graduate",
  "user-injured",
  "user-lock",
  "user-md",
  "user-minus",
  "user-ninja",
  "user-nurse",
  "user-plus",
  "user-secret",
  "user-shield",
  "user-slash",
  "user-tag",
  "user-tie",
  "user-times",
  "users",
  "users-cog",
  "utensil-spoon",
  "utensils",
  "vector-square",
  "venus",
  "venus-double",
  "venus-mars",
  "vial",
  "vials",
  "video",
  "video-slash",
  "vihara",
  "voicemail",
  "volleyball-ball",
  "volume-down",
  "volume-mute",
  "volume-off",
  "volume-up",
  "vote-yea",
  "vr-cardboard",
  "walking",
  "wallet",
  "warehouse",
  "water",
  "wave-square",
  "weight",
  "weight-hanging",
  "wheelchair",
  "wifi",
  "wind",
  "window-close",
  "window-maximize",
  "window-minimize",
  "window-restore",
  "wine-bottle",
  "wine-glass",
  "wine-glass-alt",
  "won-sign",
  "wrench",
  "x-ray",
  "yen-sign",
  "yin-yang",
   

  // ─── Police icon (free-solid) ───


  // ─── Additional food-related icons (free-solid) ───
  "drumstick-bite",
  "fish",
  "hotdog"
];


/**
 * IconPicker props:
 *   - open: boolean
 *   - onClose: () => void
 *   - onSelect: (fullClass: string) => void    // fullClass = e.g. "fas fa-home"
 */
function IconPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (fullClass: string) => void;
}) {
  // Search + pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const ITEMS_PER_PAGE = 24;

  // Whenever searchTerm changes, reset pageIndex to 0
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);

  // Filter icons by searchTerm (case‐insensitive substring match)
  const filtered = ALL_FAS_ICONS.filter((ic) =>
    ic.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // The slice of icons to show on this page
  const start = pageIndex * ITEMS_PER_PAGE;
  const pageIcons = filtered.slice(start, start + ITEMS_PER_PAGE);

  const handleIconClick = (iconName: string) => {
    onSelect(`fas fa-${iconName}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen || onClose()}>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
          <DialogDescription>
            Search, browse, and select a <code>fas fa-…</code> icon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Search Input */}
          <Input
            placeholder="Search icons by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Icon Grid */}
          <div className="grid grid-cols-6 gap-3 h-64 overflow-y-auto border rounded p-2">
            {pageIcons.map((iconName) => (
              <button
                key={iconName}
                className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleIconClick(iconName)}
              >
                <i className={`fas fa-${iconName} text-2xl text-gray-700`} />
                <span className="text-xs mt-1 truncate">{iconName}</span>
              </button>
            ))}
            {pageIcons.length === 0 && (
              <div className="col-span-6 text-center text-gray-500">No icons found.</div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pageIndex + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={pageIndex + 1 >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Service {
  _id: string;
  service_name: string;
  fas_fa_icon: string;
  service_description: string;
  createdAt: string;
}

export default function ServicesManagement() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState<number>(1); // backend is 1-based
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  // IconPicker open state (shared by Create/Edit)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // Currently selected service (for preview/edit)
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form state (for both Create and Edit)
  const [serviceForm, setServiceForm] = useState<{
    _id?: string;
    service_name: string;
    fas_fa_icon: string;
    service_description: string;
  }>({
    service_name: "",
    fas_fa_icon: "",
    service_description: "",
  });

  // Generate Services dialog state
  const [generateOption, setGenerateOption] = useState<"" | "manual" | "ai">("");
  const [manualServicesText, setManualServicesText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ─── Fetch services whenever projectId / page / rowsPerPage changes ───
  useEffect(() => {
    if (!projectId) return;
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, page, rowsPerPage]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await httpFile.post(
        "fetch_services",
        { projectId, page, limit: rowsPerPage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        toast.error("Invalid token");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setServices(res.data.services || []);
      setTotalServices(res.data.totalServices || 0);
    } catch {
      toast.error("Failed to fetch services data");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (delta: number) => {
    const newPage = page + delta;
    if (newPage < 1) return;
    if ((newPage - 1) * rowsPerPage >= totalServices) return;
    setPage(newPage);
  };
  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(1);
  };

  // Delete a service
  const handleDeleteService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await httpFile.delete(`/delete_service/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        toast.success("Service deleted successfully!");
        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      } else if (res.status === 401) {
        toast.error("Invalid token");
      }
    } catch {
      toast.error("Error deleting service.");
    }
  };

  // Open “Create” dialog (reset form)
  const openCreateDialog = () => {
    setServiceForm({
      service_name: "",
      fas_fa_icon: "",
      service_description: "",
    });
    setSelectedService(null);
    setIsCreateDialogOpen(true);
  };

  // Open “Edit” dialog (populate form)
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setServiceForm({
      _id: service._id,
      service_name: service.service_name,
      fas_fa_icon: service.fas_fa_icon,
      service_description: service.service_description,
    });
    setIsEditDialogOpen(true);
  };

  // Open “Preview” dialog
  const openPreviewDialog = (service: Service) => {
    setSelectedService(service);
    setIsPreviewDialogOpen(true);
  };

  // Create a new service
  const handleCreateService = async () => {
    if (!serviceForm.service_name.trim()) {
      toast.error("Service name is required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await httpFile.post(
        "/create_service",
        {
          projectId,
          service_name: serviceForm.service_name,
          service_description: serviceForm.service_description,
          fas_fa_icon: serviceForm.fas_fa_icon,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Service added successfully!");
      setIsCreateDialogOpen(false);
      fetchServices();
    } catch {
      toast.error("Error saving service.");
    }
  };

  // Edit an existing service
  const handleEditService = async () => {
    if (!selectedService || !serviceForm.service_name.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await httpFile.put(
        `/update_service/${serviceForm._id}`,
        {
          projectId,
          service_name: serviceForm.service_name,
          service_description: serviceForm.service_description,
          fas_fa_icon: serviceForm.fas_fa_icon,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Service updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch {
      toast.error("Error updating service.");
    }
  };

  // Add new services (manual or AI)
  const handleGenerateServices = async () => {
    if (generateOption === "manual") {
      let names: string[] = [];
      if (selectedFile) {
        // Parse Excel file
        try {
          const data = await readFileAsArrayBuffer(selectedFile);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const fromFile = rows
            .map((r) => (typeof r[0] === "string" ? r[0].trim() : ""))
            .filter((v) => v);
          names = [...fromFile];
        } catch {
          toast.error("Failed to parse Excel file.");
          return;
        }
      }
      if (manualServicesText.trim()) {
        const manualNames = manualServicesText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
        names = names.concat(manualNames);
      }
      if (!names.length) {
        toast.error("Please enter service names or select an Excel file.");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        await httpFile.post(
          "/addNewServices",
          { projectId, wantAiServices: 0, services: names },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Services queued for creation!");
        setIsGenerateDialogOpen(false);
        setManualServicesText("");
        setSelectedFile(null);
        fetchServices();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to add manual services");
      }
    } else if (generateOption === "ai") {
      try {
        const token = localStorage.getItem("token");
        const res = await httpFile.post(
          "/addNewServices",
          { projectId, wantAiServices: 1 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success(res.data.message || "AI services queued");
        setIsGenerateDialogOpen(false);
        fetchServices();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to queue AI services");
      }
    }
    setGenerateOption("");
  };

  // Utility to read an uploaded file as an ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject("No result");
        }
      };
      reader.onerror = () => reject("File read error");
      reader.readAsArrayBuffer(file);
    });

  // called when an icon is selected in the IconPicker
  const handleIconSelect = useCallback((fullClass: string) => {
    setServiceForm((prev) => ({
      ...prev,
      fas_fa_icon: fullClass,
    }));
  }, []);

  return (
    <div className="space-y-6 font-poppins">
      {/* ─── Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Services Management
              </h1>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Manage your project services
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {/* ─── Auto Services Button ─── */}
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Wand2 className="h-4 w-4 mr-2" />
                Auto Services
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>How do you want to add services?</DialogTitle>
                <DialogDescription>Choose your preferred method</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* ─── Manual Option ─── */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    generateOption === "manual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setGenerateOption("manual")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="font-medium">Manual Entry</h4>
                      <p className="text-sm text-gray-600">Enter service names or upload Excel</p>
                    </div>
                  </div>

                  {generateOption === "manual" && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">
                          One service name per line
                        </label>
                        <Textarea
                          placeholder={`Web Development\nSEO Services\nDigital Marketing`}
                          value={manualServicesText}
                          onChange={(e) => setManualServicesText(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Or upload Excel file</label>
                        <Input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedFile(e.target.files[0]);
                            } else {
                              setSelectedFile(null);
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── AI Option ─── */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    generateOption === "ai"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setGenerateOption("ai")}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="font-medium">AI Services</h4>
                      <p className="text-sm text-gray-600">
                        New services will be added in background
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsGenerateDialogOpen(false);
                    setGenerateOption("");
                    setManualServicesText("");
                    setSelectedFile(null);
                  }}
                >
                  ❌ Cancel
                </Button>
                <Button
                  onClick={handleGenerateServices}
                  disabled={!generateOption}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  OK
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ─── Create New Service Button ─── */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>Add a new service to your project</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Service Name */}
                <div>
                  <label className="text-sm font-medium">Service Name</label>
                  <Input
                    value={serviceForm.service_name}
                    onChange={(e) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        service_name: e.target.value,
                      }))
                    }
                    placeholder="Enter service name"
                  />
                </div>

                {/* Icon Picker (button → opens IconPicker dialog) */}
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      onClick={() => setIsIconPickerOpen(true)}
                      className="flex items-center gap-2"
                    >
                      {serviceForm.fas_fa_icon ? (
                        <i className={`${serviceForm.fas_fa_icon} text-xl`} />
                      ) : (
                        <span className="opacity-60">Choose Icon</span>
                      )}
                    </Button>
                    {serviceForm.fas_fa_icon && (
                      <Badge variant="outline">{serviceForm.fas_fa_icon}</Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={serviceForm.service_description}
                    onChange={(e) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        service_description: e.target.value,
                      }))
                    }
                    placeholder="Enter service description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateService}>Create Service</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Services Table ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell className="font-medium">
                        {service.service_name}
                      </TableCell>
                      <TableCell>
                        <i className={`${service.fas_fa_icon} text-lg text-blue-600`} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.service_description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPreviewDialog(service)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete “{service.service_name}”?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteService(service._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Simple Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(-1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {Math.ceil(totalServices / rowsPerPage) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(1)}
                    disabled={page * rowsPerPage >= totalServices}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Edit Service Dialog ─── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input
                value={serviceForm.service_name}
                onChange={(e) =>
                  setServiceForm((prev) => ({ ...prev, service_name: e.target.value }))
                }
                placeholder="Enter service name"
              />
            </div>

            {/* Icon Picker in Edit */}
            <div>
              <label className="text-sm font-medium">Icon</label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  onClick={() => setIsIconPickerOpen(true)}
                  className="flex items-center gap-2"
                >
                  {serviceForm.fas_fa_icon ? (
                    <i className={`${serviceForm.fas_fa_icon} text-xl`} />
                  ) : (
                    <span className="opacity-60">Choose Icon</span>
                  )}
                </Button>
                {serviceForm.fas_fa_icon && (
                  <Badge variant="outline">{serviceForm.fas_fa_icon}</Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={serviceForm.service_description}
                onChange={(e) =>
                  setServiceForm((prev) => ({
                    ...prev,
                    service_description: e.target.value,
                  }))
                }
                placeholder="Enter service description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Update Service</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Preview Service Dialog ─── */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Service Preview</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <i
                  className={`${selectedService.fas_fa_icon} text-4xl text-blue-600 mb-3`}
                />
                <h3 className="text-xl font-semibold">{selectedService.service_name}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedService.service_description}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-gray-600">
                    {new Date(selectedService.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Icon Class:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedService.fas_fa_icon}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── IconPicker (shared by Create & Edit) ─── */}
      <IconPicker
        open={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={handleIconSelect}
      />
    </div>
  );
}

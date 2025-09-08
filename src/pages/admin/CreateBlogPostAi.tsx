import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { httpFile } from "../../config.js";

type TreeNode = { name: string; id: string; children: TreeNode[] };



const STYLE_MAP: Record<(typeof BLOG_TYPES)[number]["id"], string> = {
  how: "how to",
  best: "best",
  comparison: "comparison",
  what: "what",

};

const BLOG_TYPES = [
  { id: "how", label: "How-To", note: "Step-by-step guides" },
  { id: "best", label: "Best", note: "Telling about best" },
  { id: "comparison", label: "Comparison", note: "A comparison B breakdown" },
  { id: "what", label: "What", note: "What is the reason or use of…" },
] as const;


export default function AiBlogsWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProjectId = (location.state as any)?.projectId;
  const queryProjectId = new URLSearchParams(location.search).get("projectId");
  const projectId = stateProjectId || queryProjectId || "";

  const [step, setStep] = useState(1);

  // Step 1: blog type
  const [blogType, setBlogType] = useState<(typeof BLOG_TYPES)[number]["id"] | null>(null);

  // Step 2: location (dynamic)
  const [locationBased, setLocationBased] = useState<boolean>(false);
  const [locLoading, setLocLoading] = useState(false);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [locSearch, setLocSearch] = useState("");

  // Step 3: quantity or manual
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [count, setCount] = useState<number>(3);
  const [manualInput, setManualInput] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  // Step 4: titles (editable)
  const [titles, setTitles] = useState<string[]>([]);

  // Step 5: finish -> create blogs
  const [author, setAuthor] = useState<string>("exz");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const totalSteps = 5;
  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return "Choose Blog Type";
      case 2:
        return "Choose Locations (optional)";
      case 3:
        return "How Many Titles?";
      case 4:
        return "Review & Edit Titles";
      case 5:
        return "Generate Blogs";
      default:
        return "AI Blog Generator";
    }
  }, [step]);

  // ----- load locations tree (step 2) -----
  useEffect(() => {
    const fetchLocations = async () => {
      if (!locationBased) return;
      if (!projectId) {
        toast({
          title: "Project missing",
          description: "projectId is required to load locations",
          variant: "destructive"
        });
        return;
      }
      try {
        setLocLoading(true);
        const res = await httpFile.post(
          "/getProjectLocations",
          { projectId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data: TreeNode[] = Array.isArray(res?.data?.data) ? res.data.data : [];
        setTree(data);
      } catch (err: any) {
        console.log(err, "error while loading locations");
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to load locations",
          variant: "destructive"
        });
      } finally {
        setLocLoading(false);
      }
    };
    if (step === 2) fetchLocations();
  }, [step, locationBased, projectId, token]);

  // ----- Tree helpers -----
  const isNodeChecked = (n: TreeNode) => selectedIds.has(n.id);
  const toggleNode = (n: TreeNode) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(n.id)) next.delete(n.id);
      else next.add(n.id);
      return next;
    });
  };
  const allIds = (nodes: TreeNode[]): string[] =>
    nodes.flatMap(n => [n.id, ...(n.children?.length ? allIds(n.children) : [])]);
  const selectAll = () => setSelectedIds(new Set(allIds(tree)));
  const clearAll = () => setSelectedIds(new Set());

  const filteredTree = useMemo<TreeNode[]>(() => {
    if (!locSearch.trim()) return tree;
    const q = locSearch.toLowerCase();
    const filterRec = (node: TreeNode): TreeNode | null => {
      const matchSelf = node.name.toLowerCase().includes(q);
      const kids = node.children.map(filterRec).filter(Boolean) as TreeNode[];
      if (matchSelf || kids.length) return { ...node, children: kids };
      return null;
    };
    return tree.map(filterRec).filter(Boolean) as TreeNode[];
  }, [tree, locSearch]);

  const locationNames = useMemo(() => {
    const names: string[] = [];
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach(n => {
        if (selectedIds.has(n.id)) names.push(n.name);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(tree);
    return Array.from(new Set(names));
  }, [selectedIds, tree]);

  const collectSelected = (): { id: string; name: string; path: string[] }[] => {
    const out: { id: string; name: string; path: string[] }[] = [];
    const walk = (nodes: TreeNode[], path: string[]) => {
      nodes.forEach(n => {
        const nextPath = [...path, n.name];
        if (selectedIds.has(n.id)) out.push({ id: n.id, name: n.name, path: nextPath });
        if (n.children?.length) walk(n.children, nextPath);
      });
    };
    walk(tree, []);
    return out;
  };

  // ----- Generate titles from API (auto mode) -----
  const styleString = blogType ? STYLE_MAP[blogType] : "";
  const requestTitlesFromApi = async (desiredCount?: number) => {
    if (!projectId) {
      toast({
        title: "Missing projectId",
        description: "Cannot generate without projectId.",
        variant: "destructive"
      });
      return false;
    }
    if (!styleString) {
      toast({
        title: "Pick a type",
        description: "Please choose one blog type to continue.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setGenLoading(true);
      const payload = {
        projectId,
        style: styleString,
        count: desiredCount ?? count,
        locations: locationBased ? locationNames : []
      };

      const res = await httpFile.post("/generateBlogTitles", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      const arr: string[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      if (!arr.length) {
        toast({
          title: "No titles returned",
          description: "The API returned no titles.",
          variant: "destructive"
        });
        return false;
      }
      setTitles(arr);
      return true;
    } catch (err: any) {
      console.error("generateBlogTitles error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to generate titles.",
        variant: "destructive"
      });
      return false;
    } finally {
      setGenLoading(false);
    }
  };

  // ----- Manual titles -> array -----
  const fromManual = () => {
    const lines = manualInput
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 10);
    setTitles(lines);
  };

  // ----- Navigation -----
  const next = async () => {
    if (step === 1 && !blogType) {
      toast({
        title: "Pick a type",
        description: "Please choose one blog type to continue.",
        variant: "destructive"
      });
      return;
    }
    if (step === 2) {
      const selected = collectSelected();
      console.log("Selected locations count:", selected.length);
      console.log("Selected locations (flat):", selected.map(s => ({ id: s.id, name: s.name })));
      console.log("Selected locations (with path):", selected);
    }
    if (step === 3) {
      if (mode === "auto") {
        if (!count || count < 1 || count > 10) {
          toast({
            title: "Missing / Invalid count",
            description: "Set a count between 1 and 10.",
            variant: "destructive"
          });
          return;
        }
        const ok = await requestTitlesFromApi(count);
        if (!ok) return;
      } else {
        if (!manualInput.trim()) {
          toast({
            title: "Missing titles",
            description: "Enter at least one title.",
            variant: "destructive"
          });
          return;
        }
        fromManual();
      }
    }
    if (step === 4 && !titles.length) {
      toast({
        title: "No titles",
        description: "Add at least one title.",
        variant: "destructive"
      });
      return;
    }
    setStep(Math.min(step + 1, totalSteps));
  };

  const back = () => setStep(Math.max(step - 1, 1));

  // ----- Regenerate helpers -----
  const regenerateOne = (i: number) => {
    if (!blogType) return;
    const withLoc =
      locationBased && locationNames.length ? ` in ${locationNames[i % locationNames.length]}` : "";
    setTitles(prev => {
      const copy = [...prev];
      copy[i] = `New ${STYLE_MAP[blogType]} Title${withLoc} #${i + 1}`;
      return copy;
    });
  };

  const regenerateAll = async () => {
    const desired = titles.length || count || 5;
    await requestTitlesFromApi(desired);
  };

  const addEmptyTitle = () => {
    if (titles.length >= 10) {
      toast({ title: "Limit reached", description: "Max 10 titles.", variant: "destructive" });
      return;
    }
    setTitles(prev => [...prev, `New Title ${prev.length + 1}`]);
  };

  // ----- Finish: call create_ai_blog with titles[] -----
  const finish = async () => {
    if (!projectId) {
      toast({
        title: "Missing projectId",
        description: "Cannot generate without projectId.",
        variant: "destructive"
      });
      return;
    }
    if (!titles.length) {
      toast({
        title: "No titles",
        description: "Add at least one title.",
        variant: "destructive"
      });
      return;
    }
    if (!blogType) {
      toast({
        title: "Type missing",
        description: "Please choose a blog type.",
        variant: "destructive"
      });
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        projectId,
        title: titles,                     // array of titles
        type: blogType,                    // ✅ send the id ("how", "whychoose", etc.)
        authorName: author || undefined
      };


      const res = await httpFile.post("/create_ai_blog", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      setDone(true);
      toast({
        title: "Blogs created",
        description: `Created ${res?.data?.count ?? titles.length} blog(s).`
      });
    } catch (err: any) {
      console.error("create_ai_blog error:", err);
      toast({
        title: "Generation failed",
        description: err?.response?.data?.message || "The blog creation API failed.",
        variant: "destructive"
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ----- UI -----
  const Stepper = () => (
    <div className="flex items-center space-x-1 overflow-x-auto pb-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(i => (
        <div key={i} className={`flex items-center flex-shrink-0 ${i > 1 && "ml-1"}`}>
          <div
            className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
              ${step === i ? "bg-blue-600 text-white" : step > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            {step > i ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : i}
          </div>
          {i < totalSteps && <div className={`h-1 w-3 sm:w-6 ${step > i ? "bg-green-500" : "bg-gray-200"}`}></div>}
        </div>
      ))}
    </div>
  );

  const TypeCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {BLOG_TYPES.map(t => {
        const active = blogType === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setBlogType(t.id)}
            className={`text-left border rounded-lg p-4 hover:shadow-md transition-all
              ${active ? "ring-2 ring-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-gray-500">{t.note}</div>
              </div>
              {active && <Badge variant="secondary">Selected</Badge>}
            </div>
          </button>
        );
      })}
    </div>
  );

  const Tree = ({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) => (
    <div className={depth === 0 ? "space-y-2" : "space-y-1"}>
      {nodes.map(n => (
        <div key={n.id} className="flex flex-col">
          <label className="flex items-center gap-2" style={{ paddingLeft: depth * 16 }}>
            <Checkbox checked={isNodeChecked(n)} onCheckedChange={() => toggleNode(n)} />
            <span className="text-sm">{n.name}</span>
          </label>
          {n.children?.length ? <Tree nodes={n.children} depth={depth + 1} /> : null}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pick a blog style</h3>
            <TypeCards />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={locationBased} onCheckedChange={v => setLocationBased(!!v)} id="locbased" />
              <Label htmlFor="locbased">Make titles location-based?</Label>
            </div>

            {locationBased && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search locations…"
                      className="pl-10"
                      value={locSearch}
                      onChange={e => setLocSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={selectAll} disabled={locLoading}>
                    Select All
                  </Button>
                  <Button variant="outline" onClick={clearAll} disabled={locLoading}>
                    Clear
                  </Button>
                </div>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                  {locLoading ? (
                    <div className="text-sm text-gray-500">Loading locations…</div>
                  ) : filteredTree.length ? (
                    <Tree nodes={filteredTree} />
                  ) : (
                    <div className="text-sm text-gray-500">No matching locations.</div>
                  )}
                </div>

                <div className="text-xs text-gray-600">
                  Selected: <Badge variant="outline">{selectedIds.size}</Badge>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button variant={mode === "auto" ? "default" : "outline"} onClick={() => setMode("auto")}>
                Auto (count)
              </Button>
              <Button variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>
                Manual (titles)
              </Button>
            </div>

            {mode === "auto" ? (
              <div className="space-y-2">
                <Label htmlFor="count">How many blog titles? (1–10)</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={e => setCount(Math.min(10, Math.max(1, Number(e.target.value || 1))))}
                  className="w-32"
                />
                {genLoading && <div className="text-xs text-gray-500">Generating titles…</div>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="manual">Enter titles (one per line, max 10)</Label>
                <textarea
                  id="manual"
                  className="w-full min-h-48 border rounded-md p-3"
                  placeholder="Title 1&#10;Title 2&#10;Title 3"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Edit Titles</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addEmptyTitle}>
                  Add Title
                </Button>
                <Button variant="outline" onClick={regenerateAll} disabled={genLoading}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  {genLoading ? "Regenerating…" : "Regenerate All"}
                </Button>
              </div>
            </div>

            {!titles.length ? (
              <div className="text-sm text-gray-500">No titles yet.</div>
            ) : (
              <div className="space-y-3">
                {titles.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={t}
                      onChange={e =>
                        setTitles(prev => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                      }
                    />
                    <Button variant="outline" onClick={() => regenerateOne(i)}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setTitles(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            {!done ? (
              <>
                <h3 className="text-lg font-medium">Ready to generate blogs</h3>
                <p className="text-sm text-gray-600">
                  We’ll create posts from these titles. You can schedule posting afterwards.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author (for all blogs)</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      placeholder="e.g., exz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type sent to API</Label>
                    <Input
                      readOnly
                      value={
                        blogType
                          ? (BLOG_TYPES.find(t => t.id === blogType)?.label ?? blogType)
                          : ""
                      }
                    />

                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-sm font-medium mb-2">Titles ({titles.length})</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {titles.map((t, i) => (
                      <li key={i} className="text-sm">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-md">
                  <Check className="h-4 w-4" /> Success — your blogs were created!
                </div>
                <p className="text-sm text-gray-600">You can manage or schedule them from the posts page.</p>
                <Button variant="outline" onClick={() => navigate("/admin/project-list")}>
                  Go to Projects
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">AI Blog Generator</h1>
      </div>

      <div className="flex justify-between mb-6">
        <Stepper />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{stepTitle}</CardTitle>
          <CardDescription>
            {step === 1 && "Pick the style of blogs you want to generate."}
            {step === 2 && "Optionally make titles location-based and pick the areas from your project."}
            {step === 3 && "Choose a number of titles (auto) or enter them manually."}
            {step === 4 && "Edit, add or regenerate any title before generating."}
            {step === 5 && "Generate the blogs. Scheduling coming soon."}
          </CardDescription>
        </CardHeader>

        <CardContent>{renderStep()}</CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 1 || genLoading || submitLoading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="button"
            onClick={step < totalSteps ? next : finish}
            disabled={(locLoading && step === 2) || genLoading || submitLoading || (step === 5 && done)}
          >
            {step < totalSteps ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : submitLoading ? (
              "Generating…"
            ) : done ? (
              "Done"
            ) : (
              "Finish"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

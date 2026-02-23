import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../context/CartContext";

import { GiCoffeeBeans } from "react-icons/gi";
import { MdOutlineGrain } from "react-icons/md";
import { FiPackage, FiPlus } from "react-icons/fi";

const formatMoney = (n) => `£${Number(n || 0).toFixed(2)}`;

export default function BuildYourBlend() {
  const { addCustomBlendToCart } = useCart();

  const [roastId, setRoastId] = useState(null);
  const [grindId, setGrindId] = useState(null);
  const [sizeId, setSizeId] = useState(null);
  const [extras, setExtras] = useState([]);

  const {
    data: options = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["blend-options"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/blend-options`,
        {
          headers: { Accept: "application/json" },
        },
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load options.");

      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.options)) return json.options;
      return [];
    },
  });

  //Group options by type
  const byType = useMemo(() => {
    const map = { roast: [], grind: [], size: [], extra: [] };
    for (const o of options) {
      const t = String(o?.type || "").toLowerCase();
      if (t === "roast") map.roast.push(o);
      else if (t === "grind") map.grind.push(o);
      else if (t === "size") map.size.push(o);
      else if (t === "extra") map.extra.push(o);
    }
    return map;
  }, [options]);

  // First options are auto-selected on initial load
  useEffect(() => {
    if (!options.length) return;
    if (roastId == null && byType.roast.length)
      setRoastId(Number(byType.roast[0].id));
    if (grindId == null && byType.grind.length)
      setGrindId(Number(byType.grind[0].id));
    if (sizeId == null && byType.size.length)
      setSizeId(Number(byType.size[0].id));
  }, [options.length, byType, roastId, grindId, sizeId]);

  const roast = useMemo(
    () => byType.roast.find((o) => Number(o.id) === Number(roastId)),
    [byType.roast, roastId],
  );
  const grind = useMemo(
    () => byType.grind.find((o) => Number(o.id) === Number(grindId)),
    [byType.grind, grindId],
  );
  const size = useMemo(
    () => byType.size.find((o) => Number(o.id) === Number(sizeId)),
    [byType.size, sizeId],
  );

  // Set used for fast lookup
  const selectedExtras = useMemo(() => {
    const set = new Set(extras.map(Number));
    return byType.extra.filter((o) => set.has(Number(o.id)));
  }, [extras, byType.extra]);

  // Calculate price based on selected options
  const price = useMemo(() => {
    const base = Number(size?.price_delta || 0);
    const roastMod = Number(roast?.price_delta || 0);
    const grindMod = Number(grind?.price_delta || 0);
    const extrasMod = selectedExtras.reduce(
      (sum, o) => sum + Number(o.price_delta || 0),
      0,
    );
    return base + roastMod + grindMod + extrasMod;
  }, [size, roast, grind, selectedExtras]);

  const canAdd = !!roastId && !!grindId && !!sizeId && !isLoading && !isError;

  const toggleExtra = (id) => {
    const n = Number(id);
    setExtras((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  };

  const handleAddToCart = () => {
    if (!canAdd) return;

    addCustomBlendToCart({
      roast_option_id: Number(roastId),
      grind_option_id: Number(grindId),
      size_option_id: Number(sizeId),
      extras: extras.map(Number),

      roast_name: roast?.name || "",
      grind_name: grind?.name || "",
      size_name: size?.name || "",
      extras_names: selectedExtras.map((x) => x.name),

      price_estimate: Number(price),
    });
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen font-(--font-body)">
      <Navbar alwaysVisible />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-14">
            <p className="mt-2 text-xs tracking-[0.25em] uppercase text-dark-muted">
              Build
            </p>

            <h1 className=" mt-1 text-4xl md:text-5xl font-semibold tracking-tight">
              Custom Blend
            </h1>

            <p className="text-dark-muted mt-3 max-w-xl leading-relaxed">
              Create your own unique blend.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* BUILDER */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-dark-border bg-dark-surface overflow-hidden">
                <div className="px-7 py-6 border-b border-dark-border flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-wide">
                    Blend Builder
                  </span>
                </div>

                <div className="p-7 space-y-10">
                  <OptionGrid
                    title="Roast level"
                    icon={<GiCoffeeBeans size={28} />}
                    options={byType.roast}
                    value={roastId}
                    onChange={setRoastId}
                  />

                  <OptionGrid
                    title="Grind type"
                    icon={<MdOutlineGrain size={28} />}
                    options={byType.grind}
                    value={grindId}
                    onChange={setGrindId}
                  />

                  <OptionGrid
                    title="Bag size"
                    icon={<FiPackage size={28} />}
                    options={byType.size}
                    value={sizeId}
                    onChange={setSizeId}
                    showPrice
                  />

                  {/* EXTRAS */}
                  <div>
                    <h3 className="flex items-center gap-3 text-sm font-semibold mb-3">
                      <FiPlus size={22} />
                      Extras
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {byType.extra.map((o) => {
                        const active = extras.includes(Number(o.id));
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => toggleExtra(o.id)}
                            className={[
                              "text-left rounded-2xl border p-4 transition",
                              active
                                ? "border-brand bg-brand/10"
                                : "border-dark-border bg-dark-bg hover:border-brand",
                            ].join(" ")}
                          >
                            <div className="flex justify-between items-center gap-4">
                              <p className="font-semibold">{o.name}</p>
                              <span className="text-sm text-dark-muted">
                                +{formatMoney(o.price_delta)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                    className="w-full bg-brand text-black py-4 rounded-xl font-semibold text-lg hover:bg-brand-hover transition disabled:opacity-60"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div>
              <div className="rounded-3xl border border-dark-border bg-dark-card p-7">
                <p className="text-xs uppercase text-dark-muted">Summary</p>

                <div className="mt-6 space-y-4">
                  <Row label="Roast" value={roast?.name || "—"} />
                  <Row label="Grind" value={grind?.name || "—"} />
                  <Row label="Size" value={size?.name || "—"} />

                  <div className="h-px bg-dark-border" />

                  <Row
                    label="Total"
                    value={
                      <span className="text-brand font-bold text-lg">
                        {formatMoney(price)}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionGrid({
  title,
  icon,
  options,
  value,
  onChange,
  showPrice = false,
}) {
  return (
    <div>
      <h3 className="flex items-center gap-3 text-sm font-semibold mb-3">
        {icon}
        {title}
      </h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((o) => {
          const active = Number(value) === Number(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(Number(o.id))}
              className={[
                "text-left rounded-2xl border p-4 transition",
                active
                  ? "border-brand bg-brand/10"
                  : "border-dark-border bg-dark-bg hover:border-brand",
              ].join(" ")}
            >
              <div className="flex justify-between items-center gap-4">
                <p className="font-semibold">{o.name}</p>
                <span className="text-sm text-dark-muted">
                  {showPrice
                    ? formatMoney(o.price_delta)
                    : Number(o.price_delta || 0) === 0
                      ? "Included"
                      : `+${formatMoney(o.price_delta)}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-dark-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { inventoryService } from "../services/inventoryService.js";

const DEMO_BARCODES = [
  { barcode: "1111", label: "Paracetamol" },
  { barcode: "2222", label: "Crocin" },
  { barcode: "3333", label: "Dolo" },
];

export function ScanAddMedicinePage() {
  const [mode, setMode] = useState("camera"); // camera | manual
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");

  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState(45);
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  const qrRegionId = "medibridge-qr-reader";
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  const canSubmit = useMemo(() => {
    if (!barcode.trim()) return false;
    if (!medicineName.trim()) return false;
    if (!expiryDate) return false;
    if (!batchNumber.trim()) return false;
    if (Number(quantity) < 0) return false;
    if (Number(price) < 0) return false;
    return true;
  }, [barcode, medicineName, expiryDate, batchNumber, quantity, price]);

  async function startScan() {
    if (scanning) return;
    setScanning(true);
    try {
      const html5 = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const code = String(decodedText).trim();
          setBarcode(code);
          toast.success(`Scanned barcode: ${code}`);
          await stopScan();
        },
        () => {},
      );
    } catch {
      toast.error("Camera scan failed. Use manual barcode input.");
      setMode("manual");
      setScanning(false);
    }
  }

  const stopScan = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      await s.stop();
      await s.clear();
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopScan();
    };
  }, [stopScan]);

  async function onCheckBarcode() {
    if (!barcode.trim()) return;
    try {
      const res = await inventoryService.addMedicine({
        action: "prefill",
        barcode: barcode.trim(),
      });
      const m = res.medicine;
      if (m) {
        setMedicineName(m.medicineName || "");
        setManufacturer(m.manufacturer || "");
        setCategory(m.category || "General");
        setDescription(m.description || "");
        setImage(m.image || "");
        toast.success("Autofilled from medicine database");
      } else {
        toast("Barcode not found. Enter details manually.", { icon: "ℹ️" });
      }
    } catch (err) {
      toast.error(err.message || "Lookup failed");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await inventoryService.addMedicine({
        action: "add",
        barcode: barcode.trim(),
        medicine: {
          barcode: barcode.trim(),
          medicineName,
          manufacturer,
          category,
          description,
          image,
        },
        inventory: {
          quantity: Number(quantity),
          price: Number(price),
          expiryDate,
          batchNumber,
        },
      });
      toast.success("Added to inventory");
      setBarcode("");
      setMedicineName("");
      setManufacturer("");
      setDescription("");
      setImage("");
      setQuantity(10);
      setPrice(45);
      setExpiryDate("");
      setBatchNumber("");
    } catch (err) {
      toast.error(err.message || "Add failed");
    }
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan medicine</h1>
          <p className="text-base-content/70">
            Hackathon-friendly workflow: scan barcode → autofill → add quantity/price/expiry/batch.
          </p>
        </div>
        <div className="join">
          <button
            className={`btn btn-sm join-item ${mode === "camera" ? "btn-active" : ""}`}
            onClick={() => setMode("camera")}
            type="button"
          >
            Camera
          </button>
          <button
            className={`btn btn-sm join-item ${mode === "manual" ? "btn-active" : ""}`}
            onClick={() => setMode("manual")}
            type="button"
          >
            Manual
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Barcode</h2>
              {mode === "camera" ? (
                <div className="join">
                  {!scanning ? (
                    <button className="btn btn-primary btn-sm join-item" onClick={startScan} type="button">
                      Start scan
                    </button>
                  ) : (
                    <button className="btn btn-sm join-item" onClick={stopScan} type="button">
                      Stop
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {mode === "camera" ? (
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-3">
                <div id={qrRegionId} ref={qrRef} />
                <div className="mt-2 text-xs text-base-content/60">
                  If camera access fails, switch to Manual. Demo barcodes:{" "}
                  {DEMO_BARCODES.map((b) => `${b.barcode} (${b.label})`).join(", ")}.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  className="input input-bordered w-full"
                  placeholder="Enter barcode e.g. 1111"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {DEMO_BARCODES.map((b) => (
                    <button
                      key={b.barcode}
                      className="btn btn-xs btn-ghost border border-base-300"
                      type="button"
                      onClick={() => setBarcode(b.barcode)}
                    >
                      {b.barcode} • {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="join w-full">
              <input
                className="input input-bordered join-item w-full"
                placeholder="Scanned/entered barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <button className="btn btn-outline join-item" type="button" onClick={onCheckBarcode}>
                Check
              </button>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <form className="card-body gap-4" onSubmit={onSubmit}>
            <h2 className="font-bold">Medicine details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input input-bordered"
                placeholder="Medicine name"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
              <input
                className="input input-bordered"
                placeholder="Manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input input-bordered"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                className="input input-bordered"
                placeholder="Image URL (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="divider my-1" />

            <h2 className="font-bold">Inventory</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input input-bordered"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                required
              />
              <input
                className="input input-bordered"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input input-bordered"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
              <input
                className="input input-bordered"
                placeholder="Batch number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary" disabled={!canSubmit}>
              Add to inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


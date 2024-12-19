import { useEffect, useState } from "react";
import { ZodError } from "zod";
import { DeleteIcon } from "~components/ui/icons/delete";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
import { Textarea } from "~components/ui/textarea";
import { cn } from "~lib/utils";
import {
  IINSTANT_INPUT_COUNT_LIMIT,
  INSTANT_INPUT_MAX_LENGTH,
} from "~utils/constants";
import {
  instantInputSchema,
  readInstantInputs,
  upsertInstantInputs,
} from "~utils/storage";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm-dialog";

export function InstantInputs() {
  const [newInput, setNewInput] = useState("");
  const [error, setError] = useState<string>("");
  const [inputs, setInputs] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const [toDeleteIndex, setToDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    loadInstantInputs();
  }, []);

  const loadInstantInputs = async () => {
    const savedInputs = await readInstantInputs();
    setInputs(savedInputs);
  };

  const handleEdit = (input: string, index: number) => {
    setIsEditing(true);
    setNewInput(input);
    setToDeleteIndex(index);
    setError("");
    setIsAdding(true);
  };
  const resetError = () => {
    setError(null);
  };
  const handleUpsertInput = async () => {
    const trimmedInput = newInput.trim();
    if (!trimmedInput) return;

    try {
      if (
        inputs.some(
          (input, index) =>
            input === trimmedInput && (!isEditing || index !== toDeleteIndex),
        )
      ) {
        setError(
          "This instant input already exists. Please enter a different one.",
        );
        return;
      }

      resetError();
      instantInputSchema.parse(trimmedInput);

      let updatedInputs;
      if (isEditing && toDeleteIndex !== null) {
        updatedInputs = [...inputs];
        updatedInputs[toDeleteIndex] = trimmedInput;
      } else {
        if (inputs.length >= IINSTANT_INPUT_COUNT_LIMIT) {
          setError(
            `Cannot create new instant inputs. Maximum limit of ${IINSTANT_INPUT_COUNT_LIMIT} reached.`,
          );
          return;
        }
        updatedInputs = [...inputs, trimmedInput];
      }

      await upsertInstantInputs(updatedInputs);
      setInputs(updatedInputs);
      resetForm();
    } catch (e) {
      if (e instanceof ZodError) {
        for (const err of e.errors) {
          setError(err.message);
        }
      } else {
        console.error("Unknown Error:", e);
      }
    }
  };

  const handleDeleteClick = (instantInput: string, index: number) => {
    setToDelete(instantInput);
    setToDeleteIndex(index);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (toDelete) {
      const updatedInputs = inputs.filter((_, i) => i !== toDeleteIndex);
      await upsertInstantInputs(updatedInputs);
      setInputs(updatedInputs);
      setDeleteConfirmOpen(false);
    }
  };

  const resetForm = () => {
    setNewInput("");
    setError("");
    setIsEditing(false);
    setIsAdding(false);
    resetError();
    setDeleteConfirmOpen(false);
  };

  const canAddMore = inputs.length < IINSTANT_INPUT_COUNT_LIMIT;
  const remainingCount = IINSTANT_INPUT_COUNT_LIMIT - inputs.length;

  if (!isAdding && inputs.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-gray-500 font-bold text-2xl">
          No instant inputs, please add one.
        </p>
        <p className="text-sm text-gray-500">
          You can add up to {IINSTANT_INPUT_COUNT_LIMIT} instant inputs
        </p>
        <Button
          onClick={() => setIsAdding(true)}
          className={cn(
            "px-4 py-2 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-primary hover:opacity-75 hover:bg-primary text-white justify-center",
          )}
        >
          Add Instant Input
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdding ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Instant Input" : "Add Instant Input"}
            </h2>
          </div>

          <div className="space-y-2 w-[700px]">
            <div className="relative">
              <Textarea
                placeholder="Add new instant input..."
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className="min-h-[100px] mb-2 w-[700px] resize-none pb-6"
                maxLength={INSTANT_INPUT_MAX_LENGTH}
              />
              <div className="absolute bottom-4 right-2 text-sm text-gray-500">
                {newInput.length}/{INSTANT_INPUT_MAX_LENGTH}
              </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpsertInput}
              className="hover:opacity-75 hover:bg-primary w-[80px]"
            >
              {isEditing ? "Update" : "Add"}
            </Button>

            <Button variant="outline" onClick={resetForm} className="w-[80px]">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Instant Inputs</h2>
            {remainingCount > 0 && (
              <p className="text-sm text-gray-500">
                {remainingCount}
                {""}
                {remainingCount === 1 ? " instant input " : " instant inputs "}
                remaining
              </p>
            )}
          </div>
          {canAddMore && (
            <Button
              onClick={() => setIsAdding(true)}
              className="hover:opacity-75 hover:bg-primary"
            >
              Add Intant Input
            </Button>
          )}
        </div>
      )}

      {inputs.length > 0 && (
        <div className="space-y-2">
          {!isAdding && (
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Existing Intant Inputs</h3>
              {!canAddMore && (
                <p className="text-sm text-red-500">Maximum limit reached</p>
              )}
            </div>
          )}
          {inputs.map((instant, index) => (
            <div
              key={instant}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1 break-words">
                <p className="font-medium whitespace-pre-wrap w-[600px]">
                  {instant}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(instant, index)}
                >
                  <FilePenLineIcon
                    size={20}
                    className="cursor-pointer select-none hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center"
                  />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(instant, index)}
                >
                  <DeleteIcon
                    size={20}
                    className="cursor-pointer select-none transition-colors duration-200 flex items-center justify-center"
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Confirm Delete"
        description={
          <>
            Are you sure you want to delete the instant input for{" "}
            <span className="font-medium italic">{toDelete}</span> ?
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

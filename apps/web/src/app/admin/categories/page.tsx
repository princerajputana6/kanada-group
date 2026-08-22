import { Button, Input } from "@kanada/ui";
import { getDb } from "@/lib/db";
import { createCategoryAction, deleteCategoryAction } from "@/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export default async function AdminCategoriesPage() {
  const db = await getDb();
  const categories = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createCategoryAction({}, formData);
        }}
        className="mt-6 flex max-w-sm gap-2"
      >
        <Input name="name" placeholder="e.g. Analog VLSI" required />
        <Button type="submit">Add</Button>
      </form>

      <ul className="mt-6 max-w-sm divide-y divide-border rounded-lg border border-border">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between px-4 py-2 text-sm">
            {category.name}
            <form action={deleteCategoryAction.bind(null, category.id)}>
              <ConfirmSubmitButton
                confirmText={`Delete category "${category.name}"?`}
                variant="ghost"
                size="sm"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-2 text-sm text-muted-foreground">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}

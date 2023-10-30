export interface CustomActionSpec {
  description: string;
  id: string;
  title: string;
  schema: Record<string, unknown>;
}

export const getAllCustomActions = async () => {
  const actionsResp = await fetch(
    'https://aragon.restspace.io/custom-actions/scripts/?$list=items'
  );
  const customActions = await actionsResp.json();
  return customActions as Record<string, CustomActionSpec>;
};

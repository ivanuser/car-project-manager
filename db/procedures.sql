-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  _table_name text,
  _column_name text,
  _column_type text,
  _column_constraint text DEFAULT ''
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = _table_name AND column_name = _column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s %s', 
                  _table_name, _column_name, _column_type, _column_constraint);
  END IF;
END;
$$ LANGUAGE plpgsql;

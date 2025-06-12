ALTER FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = statement_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

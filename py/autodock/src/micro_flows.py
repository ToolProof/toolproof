from basic_docking import remove_ligand_from_complex, upload_to_gcs

def alpha(rec_raw):
    rec_pure = remove_ligand_from_complex(rec_raw)
    upload_to_gcs(rec_pure, "ligand", rec_pure[4:])
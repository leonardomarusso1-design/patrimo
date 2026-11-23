-- Already applied on production (migration name academia_storage_bucket).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academia','academia',true,52428800,array['video/mp4','application/pdf','text/vtt']::text[]);
create policy academia_public_read on storage.objects for select to public using (bucket_id = 'academia');

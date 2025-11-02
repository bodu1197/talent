-- service_revisions 테이블에 DELETE 정책 추가 (판매자가 반려된 revision 삭제 가능)

CREATE POLICY "service_revisions_delete_policy"
    ON public.service_revisions
    FOR DELETE
    USING (
        -- 판매자 본인의 rejected revision만 삭제 가능
        status = 'rejected'
        AND EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = service_revisions.seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

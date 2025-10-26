#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
카테고리 데이터를 SQL로 변환하는 스크립트
"""
import re
import os

# 파일 경로
script_dir = os.path.dirname(os.path.abspath(__file__))
categories_file = os.path.join(script_dir, '../src/data/categories-full.ts')
output_file = os.path.join(script_dir, '../supabase/migrations/20251026040000_insert_all_categories.sql')

# TypeScript 파일 읽기
with open(categories_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 카테고리 데이터 저장
categories = []

def extract_value(text, key):
    """객체에서 특정 키의 값을 추출"""
    # 문자열 값
    match = re.search(rf"{key}:\s*['\"]([^'\"]+)['\"]", text)
    if match:
        return match.group(1)

    # 숫자 값
    match = re.search(rf"{key}:\s*(\d+)", text)
    if match:
        return match.group(1)

    # boolean 값
    match = re.search(rf"{key}:\s*(true|false)", text)
    if match:
        return match.group(1) == 'true'

    # 배열 값
    match = re.search(rf"{key}:\s*\[(.*?)\]", text)
    if match:
        array_content = match.group(1)
        items = re.findall(r"['\"]([^'\"]+)['\"]", array_content)
        return items

    return None

def parse_category(text, level=1, parent_slug=None):
    """카테고리 객체 파싱"""
    cat = {
        'id': extract_value(text, 'id'),
        'name': extract_value(text, 'name'),
        'slug': extract_value(text, 'slug'),
        'icon': extract_value(text, 'icon'),
        'description': extract_value(text, 'description'),
        'service_count': extract_value(text, 'service_count') or '0',
        'is_ai': extract_value(text, 'is_ai') or False,
        'is_popular': extract_value(text, 'is_popular') or False,
        'keywords': extract_value(text, 'keywords') or [],
        'parent_slug': parent_slug,
        'level': level
    }

    return cat

def parse_categories_recursive(text, level=1, parent_slug=None):
    """재귀적으로 카테고리 파싱"""
    # 최상위 레벨 카테고리 찾기
    pattern = r'\{[^{]*?id:\s*[\'"]([^\'"]+)[\'"][^}]*?\}'

    # 간단한 접근: 줄 단위로 파싱
    lines = text.split('\n')

    current_cat = None
    in_children = 0
    current_obj = []

    for line in lines:
        stripped = line.strip()

        # 주석 스킵
        if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue

        # 객체 시작
        if '{' in line and (('id:' in line) or (current_obj and len(current_obj) > 0)):
            current_obj.append(line)
            in_children += line.count('{') - line.count('}')
        elif current_obj:
            current_obj.append(line)
            in_children += line.count('{') - line.count('}')

            if in_children <= 0:
                # 객체 완성
                obj_text = '\n'.join(current_obj)
                if 'id:' in obj_text:
                    cat = parse_category(obj_text, level, parent_slug)
                    if cat['name']:
                        categories.append(cat)

                current_obj = []
                in_children = 0

# 단순화된 접근: 정규식으로 Level 1 카테고리만 추출
level1_pattern = r'/\/ ={10,}\s*\d+\.\s*([^=]+)={10,}[\s\S]*?\{\s*id:\s*[\'"]([^\'"]+)[\'"][^{]*?name:\s*[\'"]([^\'"]+)[\'"]'

level1_matches = re.finditer(level1_pattern, content)

print("Level 1 카테고리 추출 중...")
for match in level1_matches:
    section_name = match.group(1).strip()
    cat_id = match.group(2)
    cat_name = match.group(3)

    # 이 카테고리 섹션 전체 추출
    start_pos = match.start()
    # 다음 Level 1 카테고리 또는 파일 끝까지
    next_match = re.search(r'/\/ ={10,}\s*\d+\.', content[start_pos + 100:])
    if next_match:
        end_pos = start_pos + 100 + next_match.start()
    else:
        end_pos = len(content)

    section = content[start_pos:end_pos]

    # 이 섹션에서 상세 정보 추출
    cat = parse_category(section, 1, None)
    if cat['name']:
        categories.append(cat)
        print(f"  - {cat['name']} ({cat['slug']})")

        # Level 2 카테고리 찾기 (children 배열 내부)
        children_match = re.search(r'children:\s*\[([\s\S]*?)\](?:\s*[,}])', section)
        if children_match:
            children_text = children_match.group(1)

            # Level 2 카테고리 객체 찾기
            level2_objects = re.finditer(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"][^}]*?\}', children_text)
            for l2_match in level2_objects:
                l2_obj = l2_match.group(0)
                cat2 = parse_category(l2_obj, 2, cat['slug'])
                if cat2['name']:
                    categories.append(cat2)

                    # Level 3 카테고리 찾기 (Level 2의 children)
                    l2_children_match = re.search(r'children:\s*\[([\s\S]*?)\]', l2_obj)
                    if l2_children_match:
                        l2_children_text = l2_children_match.group(1)
                        level3_objects = re.finditer(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"][^}]*?\}', l2_children_text)
                        for l3_match in level3_objects:
                            l3_obj = l3_match.group(0)
                            cat3 = parse_category(l3_obj, 3, cat2['slug'])
                            if cat3['name']:
                                categories.append(cat3)

print(f"\n총 {len(categories)}개 카테고리 추출 완료")

# 레벨별로 분류
level1 = [c for c in categories if c['level'] == 1]
level2 = [c for c in categories if c['level'] == 2]
level3 = [c for c in categories if c['level'] == 3]

print(f"Level 1: {len(level1)}개")
print(f"Level 2: {len(level2)}개")
print(f"Level 3: {len(level3)}개")

# SQL 생성
sql = f"""-- =====================================================
-- 전체 카테고리 데이터 삽입
-- 생성일: 2025-10-26
-- =====================================================

-- 기존 카테고리 데이터 삭제 (초기화)
TRUNCATE TABLE public.categories CASCADE;

"""

def generate_insert(cats, level):
    if not cats:
        return ""

    sql = f"\n-- Level {level} 카테고리\n"
    for cat in cats:
        name = cat['name'].replace("'", "''")
        description = cat['description'].replace("'", "''") if cat['description'] else None
        keywords = cat['keywords']
        keywords_sql = f"ARRAY[{', '.join([f\"'{k}'\" for k in keywords])}]" if keywords else "ARRAY[]::TEXT[]"
        parent_sql = f"(SELECT id FROM public.categories WHERE slug = '{cat['parent_slug']}')" if cat['parent_slug'] else "NULL"
        icon = f"'{cat['icon']}'" if cat['icon'] else "NULL"
        desc_sql = f"'{description}'" if description else "NULL"

        sql += f"INSERT INTO public.categories (name, slug, parent_id, level, icon, description, keywords, service_count, is_ai_category, is_featured, is_active)\n"
        sql += f"VALUES ('{name}', '{cat['slug']}', {parent_sql}, {level}, {icon}, {desc_sql}, {keywords_sql}, {cat['service_count']}, {cat['is_ai']}, {cat['is_popular']}, true);\n\n"

    return sql

sql += generate_insert(level1, 1)
sql += generate_insert(level2, 2)
sql += generate_insert(level3, 3)

sql += f"""
-- =====================================================
-- 카테고리 삽입 완료
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 전체 카테고리 데이터 삽입 완료!';
  RAISE NOTICE 'Level 1: {len(level1)}개';
  RAISE NOTICE 'Level 2: {len(level2)}개';
  RAISE NOTICE 'Level 3: {len(level3)}개';
  RAISE NOTICE '총 {len(categories)}개 카테고리';
END $$;

-- 스키마 버전 업데이트
INSERT INTO public.schema_migrations (version) VALUES ('006_insert_all_categories')
ON CONFLICT (version) DO NOTHING;
"""

# 파일 저장
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"\n✅ SQL 파일 생성 완료: {output_file}")

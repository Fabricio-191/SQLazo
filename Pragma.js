const NORMAL_PRAGMAS = [
    'application_id',
    'auto_vacuum',
    'automatic_index',
    'busy_timeout',
    'cache_size',
    'cache_spill',
    'case_sensitive_like',
    'cell_size_check',
    'checkpoint_fullfsync',
    'collation_list',
    'compile_options',
    'data_version',
    'database_list',
    'defer_foreign_keys',
    'encoding',
    'foreign_key_check',
    'foreign_key_list',
    'foreign_keys',
    'freelist_count',
    'fullfsync',
    'function_list',
    'hard_heap_limit',
    'ignore_check_constraints',
    'incremental_vacuum',
    'index_info',
    'index_list',
    'index_xinfo',
    'integrity_check',
    'journal_mode',
    'journal_size_limit',
    'legacy_alter_table',
    'legacy_file_format',
    'locking_mode',
    'max_page_count',
    'mmap_size',
    'module_list',
    'optimize',
    'page_count',
    'page_size',
    'pragma_list',
    'query_only',
    'quick_check',
    'read_uncommitted',
    'recursive_triggers',
    'reverse_unordered_selects',
    'secure_delete',
    'shrink_memory',
    'soft_heap_limit',
    'synchronous',
    'table_info',
    'table_xinfo',
    'temp_store',
    'threads',
    'trusted_schema',
    'user_version',
    'wal_autocheckpoint',
    'wal_checkpoint'
], DEPRECATED_PRAGMAS = [
    'count_changes',
    'data_store_directory',
    'default_cache_size',
    'full_columns_names',
    'short_column_names',
    'temp_store_directory'
], OTHER_PRAGMAS = [
    'parser_trace',
    'vdbe_addoptrace',
    'vdbe_debug',
    'vdbe_listing',
    'vdbe_trace',
], TESTING_PRAGMAS = [
    'schema_version', 
    'stats', 
    'writable_schema'
], ALL_PRAGMAS = [
    ...NORMAL_PRAGMAS, 
    ...DEPRECATED_PRAGMAS, 
    ...OTHER_PRAGMAS, 
    ...TESTING_PRAGMAS
]

function runPragma(pragma = false){
    if(pragma === false) throw new Error('You didn\'t put a pragma to execute');

    if(typeof pragma === 'string'){ //'cache_size = 32000'
        const pragmaKey = pragma.split('=')[0] || pragma

        if(!ALL_PRAGMAS.includes(pragmaKey.toLowerCase())){
            throw new Error(`Not valid pragma '${pragmaKey}'`)
        }else if(DEPRECATED_PRAGMAS.includes(pragmaKey)){
            console.warn(`Using deprecated pragma '${pragmaKey}'`)
        }

        if(pragma.includes('=')) this.pragma(pragma)

        return this.pragma(pragmaKey)
    }else if(Array.isArray(pragma)){//['application_id', 'cache_size = 32000']
        if(pragma.length === 0){
            return [];
        }else if(pragma.some(p => typeof p !== 'string')){
            throw new Error('All the pragmas in the array should be strings')
        }
        
        return pragma.map(runPragma);
    }else throw new Error('Introduced pragma must be an string or array');
};


module.exports = runPragma;

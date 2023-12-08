def remove_namespace_prefixes(data):
    if isinstance(data, dict):
        return {key.split(':', 1)[-1]: remove_namespace_prefixes(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [remove_namespace_prefixes(item) for item in data]
    else:
        return data

